# claude_code_hans_test
claude_code_hans_test
claude_code

## Telegram 채널 요약 (07:00 / 19:00 KST)

`telegram_digest/channels.txt`의 채널에서 직전 알림 이후 올라온 글을 모아 Claude로 요약하고, 텔레그램 봇으로 보낸다. GitHub Actions(`.github/workflows/telegram-digest.yml`)로 실행되므로 PC가 꺼져 있어도 동작한다.

### 1회 설정
1. **채널 등록**: `telegram_digest/channels.txt`에 `@채널명`을 한 줄에 하나씩 적는다.
2. **API ID/HASH 발급**: https://my.telegram.org → API development tools
3. **세션 문자열 생성** (PC에서 1회):
   ```bash
   pip install telethon
   python telegram_digest/make_session.py
   ```
4. **봇 생성**: @BotFather → `/newbot` → 토큰 확보 → 봇에게 아무 메시지 전송 →
   `https://api.telegram.org/bot<토큰>/getUpdates`에서 `chat.id` 확인
5. **GitHub Secrets 등록**: Repo → Settings → Secrets and variables → Actions

   | Secret | 값 |
   |---|---|
   | `TG_API_ID` | 2번 API ID |
   | `TG_API_HASH` | 2번 API HASH |
   | `TG_SESSION` | 3번 출력 문자열 |
   | `TG_BOT_TOKEN` | 4번 봇 토큰 |
   | `TG_CHAT_ID` | 4번 chat.id |
   | `ANTHROPIC_API_KEY` | Claude API 키 |

6. **테스트**: Actions 탭 → Telegram Digest → Run workflow

> `TG_SESSION`은 텔레그램 계정 로그인 권한과 같다. 절대 공유하거나 커밋하지 말 것.
