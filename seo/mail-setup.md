# Почта info@arome-marketing.kz (30.10.2026)

Как устроено: ящика нет. Письма на **info@arome-marketing.kz** сервер Aromé (87.199.130.157) пересылает в Gmail **mitvantonplay5@gmail.com**. Другие адреса домена письма не принимают («нет такого пользователя»).
Ответы уходят из Gmail **от имени info@**: Gmail отправляет их через наш сервер (вход по паролю, порт 587), сервер подписывает письмо DKIM.

На сервере: Postfix (приём на 25, отправка на 587 только с шифрованием и паролем, отправлять можно только от info@), postsrsd (SRS для пересылки), dovecot-core (только проверка пароля, без IMAP), OpenDKIM (селектор `mail`). Сертификат — общий arome-marketing.kz от Let's Encrypt. Открытого реле нет — проверено снаружи.
Сменить адрес пересылки: `/etc/postfix/virtual`, затем `sudo postmap /etc/postfix/virtual && sudo systemctl reload postfix`.

## 1. DNS в панели PS.kz (домен arome-marketing.kz → DNS-записи)
| Тип | Имя | Значение |
|---|---|---|
| TXT | `mail._domainkey` | `v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtvuufRTXfABKcfEbcOyKfM3Bupn4lD0KVtTcXv1Geo5lKCfl/F0CUW4jpcIwCNRbyOyvoj4Y28yUHPcZtfrDIv20mCk4uzEmKOaYTdqly0cZC920WacqR82kVBA15bYnR+DIDkn/ELK5iRdCokrGnD9gfFqvU9FyyRcbl+SBTokWx0rvi47gcu7KuYt9SJEQXFJ4Yeb0iX+5gpVxQxQT4J3ChjQRJJ0SpPMxZz++SO8C8TR6Z7H6eFBD4kCpDnK/R3mMBQPqskM0L4CVCGLcYe2GCVb9JP86+Z1Z4qANd4woWF2PCmKjw+CL5FeQL3VpWQMa71yYpK9xEEb+qp2ArQIDAQAB` |
| TXT | `_dmarc` | `v=DMARC1; p=none; adkim=r; aspf=r` |

Уже есть и менять не нужно: MX `mail.arome-marketing.kz`, A `mail` → 87.199.130.157, SPF `v=spf1 +a +mx include:_spf.ps.kz -all` (наш IP в нём через `+a`).

## 2. Обратная запись IP (PTR) — в панели PS.kz у сервера или через поддержку
`87.199.130.157` → `mail.arome-marketing.kz`. Сейчас там внутреннее `48536.pscloud.internal`: Gmail и другие почтовики из-за этого могут класть письма в спам.

## 3. Gmail: отвечать от info@
Настройки (шестерёнка) → Все настройки → **Аккаунты и импорт** → «Отправлять письма как» → **Добавить другой адрес**:
1. Имя: `Aromé`, адрес: `info@arome-marketing.kz` → Далее.
2. SMTP-сервер: `arome-marketing.kz`, порт `587`, имя пользователя: `info@arome-marketing.kz`, пароль — из файла `private/info-smtp-pass.txt` (в папке проекта, не в git), «Защищённое соединение TLS» → Добавить аккаунт.
3. Gmail пришлёт код подтверждения на info@ — он придёт в этот же Gmail. Ввести код.
4. Там же, в «Отправлять письма как», выбрать **«Отвечать с того же адреса, на который пришло письмо»** — тогда ответ на письмо, пришедшее на info@, уйдёт от info@.
