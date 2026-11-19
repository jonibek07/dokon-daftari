# Do'kon daftari

Do'kon savdosi, rasxodlari va qarzlari hisobi uchun telefon ilovasi (PWA): kunlik naqd, karta, Click/Payme va dollar savdosi, rasxodlar, nasiya, tahlil va statistika. O'zbek va rus tillarida.

- **Ilova:** https://jonibek07.github.io/dokon-daftari/
- **Baza:** Firebase (Authentication + Firestore). Ma'lumotlarni faqat egasi va u qo'shgan sotuvchilar ko'radi.

## Yig'ish

```bash
npm install
# config.json: {"firebase": { ...firebaseConfig... }}
node build.mjs        # natija docs/ papkasiga yoziladi
MOCK=1 node build.mjs # Firebase'siz sinov versiyasi (test-dist/)
```

`firestore.rules.tmpl` faylidagi `__OWNERS__` o'rniga egasi emaili yoziladi va qoidalar Firebase konsolida **Firestore → Rules** bo'limiga joylanadi.
