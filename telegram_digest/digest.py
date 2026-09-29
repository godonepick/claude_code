"""텔레그램 채널 마스터 리스트의 새 글을 모아 Claude로 요약하고 봇으로 전송한다."""
import asyncio
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import anthropic
import requests
from telethon import TelegramClient
from telethon.sessions import StringSession

KST = timezone(timedelta(hours=9))
CHANNELS_FILE = Path(__file__).with_name("channels.txt")
SLOT_HOURS = sorted(int(h) for h in os.environ.get("DIGEST_SLOT_HOURS", "7,19").split(","))
TELEGRAM_MAX_LEN = 4000

SYSTEM_PROMPT = """너는 텔레그램 채널 글을 정리해 주는 비서다.
사용자는 반도체 후공정 QA 엔지니어이고, 간결하고 핵심 위주의 정보를 원한다.

규칙:
- 한국어로 작성한다. 영어 원문은 한국어로 요약한다.
- 채널별로 묶고, 채널마다 핵심 3~5줄 불릿으로 정리한다.
- 여러 채널에서 겹치는 이슈는 맨 위 '핵심 요약'에 한 번만 모아 적는다.
- 광고·홍보·단순 인사 글은 제외한다.
- 수치(가격, 날짜, %)는 원문 그대로 유지한다.
- 중요한 글은 제공된 링크를 줄 끝에 붙인다.
- 텔레그램 일반 텍스트로 보낼 것이므로 마크다운 기호(**, ##)는 쓰지 말고 '■', '•' 같은 기호를 쓴다."""


def load_channels() -> list[str]:
    channels = []
    for line in CHANNELS_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        channels.append(line.removeprefix("https://t.me/").removeprefix("@").strip("/"))
    return channels


def window_start(now: datetime) -> datetime:
    # 직전 슬롯부터 수집: 실행이 지연돼도 빈 구간이 생기지 않는다.
    ref = now.astimezone(KST) - timedelta(hours=1)
    candidates = [
        (ref - timedelta(days=d)).replace(hour=h, minute=0, second=0, microsecond=0)
        for d in (0, 1)
        for h in SLOT_HOURS
    ]
    return max(c for c in candidates if c <= ref)


async def collect(channels: list[str], since: datetime) -> tuple[str, list[str]]:
    client = TelegramClient(
        StringSession(os.environ["TG_SESSION"]),
        int(os.environ["TG_API_ID"]),
        os.environ["TG_API_HASH"],
    )
    sections, failed = [], []
    async with client:
        for name in channels:
            try:
                entity = await client.get_entity(name)
                lines = []
                async for msg in client.iter_messages(entity):
                    if msg.date < since:
                        break
                    if not msg.message:
                        continue
                    ts = msg.date.astimezone(KST).strftime("%m/%d %H:%M")
                    link = f"https://t.me/{entity.username}/{msg.id}" if getattr(entity, "username", None) else ""
                    lines.append(f"[{ts}] {msg.message}\n{link}")
                if lines:
                    title = getattr(entity, "title", name)
                    sections.append(f"=== 채널: {title} ({len(lines)}건) ===\n" + "\n\n".join(reversed(lines)))
            except Exception as e:
                failed.append(f"{name} ({type(e).__name__})")
    return "\n\n".join(sections), failed


def summarize(raw: str, since: datetime, now: datetime) -> str:
    client = anthropic.Anthropic()
    period = f"{since:%m/%d %H:%M} ~ {now.astimezone(KST):%m/%d %H:%M} (KST)"
    with client.beta.messages.stream(
        model="claude-opus-5-5",
        max_tokens=16000,
        output_config={"effort": "medium"},
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"수집 기간: {period}\n\n{raw}"}],
    ) as stream:
        response = stream.get_final_message()

    if response.stop_reason == "refusal":
        raise RuntimeError(f"요약 거부됨: {response.stop_details}")
    text = "".join(b.text for b in response.content if b.type == "text")
    return f"📰 텔레그램 채널 요약\n{period}\n\n{text}"


def send(text: str) -> None:
    url = f"https://api.telegram.org/bot{os.environ['TG_BOT_TOKEN']}/sendMessage"
    for i in range(0, len(text), TELEGRAM_MAX_LEN):
        r = requests.post(
            url,
            json={
                "chat_id": os.environ["TG_CHAT_ID"],
                "text": text[i : i + TELEGRAM_MAX_LEN],
                "disable_web_page_preview": True,
            },
            timeout=30,
        )
        r.raise_for_status()


def main() -> None:
    channels = load_channels()
    if not channels:
        sys.exit("channels.txt에 채널이 없습니다.")

    now = datetime.now(timezone.utc)
    since = window_start(now)
    raw, failed = asyncio.run(collect(channels, since))

    if raw:
        message = summarize(raw, since, now)
    else:
        message = f"📰 텔레그램 채널 요약\n{since:%m/%d %H:%M} 이후 새 글이 없습니다."
    if failed:
        message += "\n\n⚠️ 읽기 실패 채널: " + ", ".join(failed)
    send(message)


if __name__ == "__main__":
    main()
