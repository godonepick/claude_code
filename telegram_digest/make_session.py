"""PC에서 한 번만 실행: 텔레그램 로그인 후 TG_SESSION 값을 출력한다."""
from telethon.sync import TelegramClient
from telethon.sessions import StringSession

api_id = int(input("API ID: "))
api_hash = input("API HASH: ")

with TelegramClient(StringSession(), api_id, api_hash) as client:
    print("\n아래 문자열 전체를 GitHub Secret 'TG_SESSION'에 저장하세요 (절대 공유 금지):\n")
    print(client.session.save())
