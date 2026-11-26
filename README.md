# LUT Generator

Footage frame ekai, ona grade eke reference photos tikai dammama analyse karala `.cube` LUT ekak hadana Windows app eka.

- **Style match** – different reference photos walin tone eka match karanawa (Rec.709, S-Log3 / S-Gamut3.Cine, Cineon Film Log input).
- **Same frame** – ekama frame eke ungraded saha graded versions walin pixel-accurate LUT ekak.
- **PowerGrade** – PowerGrade still eka target tone ekata harawana correction LUT ekak.

## Install

[Releases](https://github.com/eapasindu-sudo/lut-generator/releases/latest) walin `LUT-Generator-Setup-x.y.z.exe` download karala run karanna.
Windows SmartScreen eka "Windows protected your PC" kiyala pennuwoth **More info → Run anyway** click karanna (app eka code-signed nathi nisa).

App eka open weddi aluth version ekak thiyenawada kiyala check karanawa. Thiyenawa nam download karala restart karanna kiyala ahanawa.

## Aluth version ekak release karana widiha

1. `package.json` eke `version` eka wadi karanna (e.g. `1.0.1`).
2. Commit karala tag ekak push karanna: `git tag v1.0.1 && git push origin main --tags`
3. GitHub Actions eken installer eka build karala Release ekata danawa. Install karala thiyena apps auto update wenawa.

## Build locally

```
npm install
npm start        # run
npm run dist     # build installer into dist/
```
