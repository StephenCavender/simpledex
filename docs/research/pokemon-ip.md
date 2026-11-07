# Pokémon intellectual property: PokeAPI and SimpleDex

Research notes, gathered November 7, 2026. **This is research, not legal advice.** It records what primary sources say; where the law is unsettled or a source couldn't be checked, it says so.

## Bottom line

- **PokeAPI doesn't have, or pass on, any rights to Pokémon intellectual property.** Its code is BSD-3-licensed, and its sprites repository says outright that "All image contents within are Copyright The Pokémon Company". The repository's CC0 dedication only waives rights PokeAPI itself holds, and explicitly disclaims clearing anyone else's rights ([sprites LICENCE.txt][sprites-licence]). No source found shows PokeAPI has permission from Nintendo, Game Freak, Creatures or The Pokémon Company. PokeAPI operates on tolerance, not a license.
- **The data SimpleDex uses is the safest part.** Names, numbers, Types, stats, abilities, habitat, color and evolution conditions are facts, and facts aren't copyrightable ([*Feist*][feist]); names and short phrases aren't either ([37 CFR 202.1(a)][cfr]). Pokémon names are trademarks, though ([PokeAPI LICENSE][pokeapi-licence]), so how they're used matters (see 4c).
- **The artwork is the real risk.** It's copyrighted by The Pokémon Company ([sprites LICENCE.txt][sprites-licence]), which has used DMCA takedowns against projects that merely included Pokémon character images ([2016 TPCi notice][dmca-2016]) and declines permission requests as a matter of policy ([pokemon.com Terms of Use][tpc-terms]). SimpleDex links to the images rather than hosting them; whether that avoids "displaying" them under copyright law is unsettled and depends on the court ([*Hunley v. Instagram*][hunley]).
- **Both app stores require rights to what's in the app and the listing.** Apple: "Make sure your app only includes content that you created or that you have a license to use", and you are "responsible for securing the rights to use all materials in your app icons, screenshots, and previews" ([App Review Guidelines 5.2, 2.3.9][apple]). Google Play lists "Artwork or images from … video games" as a common violation ([Play IP policy][play]). Strictly read, SimpleDex has no license for the artwork, so its acceptance depends on the reviewer and on the rights holders not objecting. That matches the earlier app's history: approved, but with screenshots rejected for showing Pokémon artwork.

## 1. PokeAPI's own stance

- **What PokeAPI is:** a free, read-only REST API "primarily an educational tool", with a fair use policy about request volume and caching ("Locally cache resources whenever you request them") ([PokeAPI docs][pokeapi-docs]). The policy says nothing about intellectual property or what consumers may do with the data.
- **Trademark notice:** the site footer and the API's license both state "Pokémon and Pokémon character names are trademarks of Nintendo." ([PokeAPI docs][pokeapi-docs], [PokeAPI LICENSE][pokeapi-licence])
- **Code license:** BSD-3-Clause, covering PokeAPI's code: "Copyright (c) © 2013–2023 Paul Hallett and PokéAPI contributors" ([PokeAPI LICENSE][pokeapi-licence]). It grants rights in PokeAPI's software, not in Pokémon material.
- **Where the data comes from:** V2 was built as "an exact mirror of Veekun's data related to the main series of games", later extended by contributors ([PokeAPI About][pokeapi-about]). Veekun describes its data as "scraped from Pokémon games" ([veekun/pokedex README][veekun]); its repository is MIT-licensed ([veekun/pokedex][veekun]).
- **Sprites and artwork:** the sprites repository exists "To save load on PokéAPI" and invites developers to use the sprites in their applications ([sprites README][sprites-readme]). Its license file begins "All image contents within are Copyright The Pokémon Company. This repository is distributed under CC0 1.0 Universal" ([sprites LICENCE.txt][sprites-licence]). CC0's own terms limit what that does:
  - The waiver applies only "to the extent that he or she is an owner of Copyright and Related Rights in the Work" (Statement of Purpose).
  - "No trademark or patent rights held by Affirmer are waived" (4a).
  - "Affirmer disclaims responsibility for clearing rights of other persons that may apply to the Work … Further, Affirmer disclaims responsibility for obtaining any necessary consents, permissions or other rights required for any use of the Work." (4c)

  So the CC0 covers PokeAPI's own contribution (the collection, file organisation), not the images, which it attributes to The Pokémon Company.
- **Fan-made sprites:** some sprites are Smogon's custom B&W-style sprites for Pokémon above #650, used "for allowing us to use and serve" them ([sprites README][sprites-readme]). That permission is Smogon's for its fan art; the characters depicted are still The Pokémon Company's.

## 2. Permission or takedowns involving PokeAPI

- **No permission found.** Nothing on PokeAPI's site, About page, license files or READMEs mentions any license or agreement with Nintendo, Game Freak, Creatures or The Pokémon Company ([PokeAPI About][pokeapi-about], [PokeAPI LICENSE][pokeapi-licence], [sprites LICENCE.txt][sprites-licence]).
- **No takedowns found against PokeAPI.** A full-text search of GitHub's public DMCA notice archive ([github/dmca][dmca], 22,490 files, cloned November 7, 2026) found no notice mentioning "pokeapi" or "PokeAPI/sprites". The archive only covers notices sent to GitHub, so this says nothing about notices elsewhere.
- **The Pokémon Company International does enforce on GitHub.** Two of its notices are in the archive:
  - March 2016, against a Chrome extension because it "includes images of Pokémon characters copyrighted by TPCi, specifically Charizard, Meowth, … Pikachu … which are being displayed and distributed via GitHub without permission" ([2016 TPCi notice][dmca-2016]).
  - March 2017, a third cease-and-desist against "PokiiMap", an app that "incorporates Pokémon's intellectual property without authorization" ([2017 TPCi notice][dmca-2017]).

  The archive also holds about 90 notices from Nintendo, mostly aimed at other games and tools (by filename; not individually reviewed).

## 3. The rights holders' published positions

- **The Pokémon Company International:** its Terms of Use state that content on its service "is the property of Pokémon and is protected by United States and international copyrights, trademarks and other intellectual property laws", and: "Because we receive thousands of such requests, our policy is to decline use of our trademarks and copyrights." ([pokemon.com Terms of Use][tpc-terms]) No fan-app or fan-site policy was found on pokemon.com; its other legal pages were behind a bot check and couldn't be read.
- **Nintendo:** its Game Content Guidelines allow gameplay videos and screenshots with "creative input and commentary" on video and image sharing platforms, and exclude "mere copies of … art collections, etc." ([Nintendo Game Content Guidelines][nintendo]). They cover video and image sharing, not apps, and they only cover content "for which Nintendo owns the copyright". Pokémon artwork is attributed to The Pokémon Company ([sprites LICENCE.txt][sprites-licence]), so these guidelines don't clearly apply to it.
- **No published permission for fan apps or Pokédex apps was found** from either company.

## 4. Legal principles (U.S. law)

### a. Facts and names

- "Facts are not copyrightable", though original selection and arrangement of a compilation can be ([*Feist Publications v. Rural Telephone Service*, 499 U.S. 340 (1991)][feist]). A Pokémon's stats, Types, numbers, abilities, height and weight are facts about the games.
- "Words and short phrases such as names, titles, and slogans" are not subject to copyright ([37 CFR 202.1(a)][cfr]).
- Not covered here: written game text such as Pokédex flavor text is expression, not fact. SimpleDex doesn't show it (its schema stores habitat and color, not descriptions; `packages/backend/convex/schema.ts`).

### b. Artwork

- The official artwork and game sprites are creative works. PokeAPI attributes their copyright to The Pokémon Company ([sprites LICENCE.txt][sprites-licence]), and TPCi has asserted that copyright against unlicensed use ([2016 TPCi notice][dmca-2016]).

### c. Trademarks

- "Pokémon and Pokémon character names are trademarks of Nintendo" ([PokeAPI LICENSE][pokeapi-licence]).
- Trademark law generally targets use that is likely to cause confusion about who makes or endorses a product ([Google Play IP policy][play], which frames trademark infringement the same way). Courts have recognised "nominative fair use", using a mark to refer to the trademarked thing itself (*New Kids on the Block v. News America Publishing*, 971 F.2d 302 (9th Cir. 1992)). **Unverified:** no primary copy of that opinion could be fetched for this research. Referring to Pokémon by name to describe them, with a clear "unofficial, not affiliated" notice, fits that idea; using "Pokémon" in SimpleDex's own name, icon or branding would not.

### d. Linking to images instead of hosting them

- **Ninth Circuit (California and the West):** under the "Server Test", embedding an image hosted on someone else's server does not "display a copy" of it, because the image is not fixed in the embedding site's memory ([*Hunley v. Instagram*, 9th Cir. 2023][hunley], following *Perfect 10 v. Amazon*, 508 F.3d 1146 (9th Cir. 2007)).
- **Elsewhere:** "Although no circuit has disapproved of Perfect 10, several district courts have either rejected or limited the Server Test", including *Goldman v. Breitbart*, 302 F. Supp. 3d 585 (S.D.N.Y. 2018), which held that embedding was enough for direct infringement ([*Hunley*, p. 23][hunley]).
- So linking helps in some courts and not in others; it's unsettled. It also doesn't change the app stores' rules, which are about what the app and listing *include* or *display*, not where files are hosted ([Apple 5.2.1][apple], [Play IP policy][play]).

## 5. App store rules

### Apple App Review Guidelines ([source][apple])

- **5.2:** "Make sure your app only includes content that you created or that you have a license to use. Your app may be removed if you've stepped over the line and used content without permission."
- **5.2.1:** "Don't use protected third-party material such as trademarks, copyrighted works, or patented ideas in your app without permission … Apps should be submitted by the person or legal entity that owns or has licensed the intellectual property and other relevant rights."
- **5.2.2:** "If your app uses, accesses, monetizes access to, or displays content from a third-party service, ensure that you are specifically permitted to do so under the service's terms of use. Authorization must be provided upon request." PokeAPI's fair use policy allows use of the API but grants nothing on Pokémon IP (section 1).
- **2.3.7:** don't "pack any of your metadata with trademarked terms … just to game the system".
- **2.3.9:** "You are responsible for securing the rights to use all materials in your app icons, screenshots, and previews". This is the most likely basis for the earlier screenshot rejection.

### Google Play Intellectual Property policy ([source][play])

- "You must ensure that all content in your app and store listing is either your own original work or that you have the necessary licenses and/or permissions to use it."
- "Developers may be required to provide evidence of their rights to use copyrighted content." Common violations include "Artwork or images from comic books, cartoons, movies, music videos, or television", "Marketing images from movies, television, or video games", and "Reproductions or 'fan art' indistinguishable from the original work under copyright".
- Trademark: "If your app uses another party's trademarks in a way that is likely to cause confusion, your app may be suspended."
- Neither store's policy mentions fan apps or unofficial apps specifically.

## 6. What this means for SimpleDex

**What PokeAPI's licenses pass on:** BSD-3 rights in PokeAPI's code, and CC0 on PokeAPI's own contributions. Neither gives SimpleDex any right to Pokémon artwork or trademarks; the CC0 text says users must clear those rights themselves (section 1).

| Part of SimpleDex | Assessment | Why |
| --- | --- | --- |
| Data: numbers, stats, Types, abilities, habitat, color, evolution conditions | **Clearly fine (copyright)** | Facts aren't copyrightable ([*Feist*][feist]); SimpleDex shows no game flavor text. |
| Pokémon names in the app | **Low risk** | Not copyrightable ([37 CFR 202.1(a)][cfr]); they're trademarks, used to refer to the Pokémon themselves, with an "unofficial, not affiliated" notice (4c). |
| "Pokémon" in the app name, icon or branding | **Avoid** | Implies affiliation; trademark and Apple 2.3.7 / Play confusion rules. SimpleDex's name and logo are its own. |
| Artwork shown in the apps (linked from GitHub) | **Risk** | Copyrighted by The Pokémon Company; no license; TPCi enforces against character images; linking's legal effect is unsettled (4d); both stores require a license for app content (5). In practice, Pokédex apps depend on reviewers and rights holders not objecting. |
| Artwork in store screenshots, icons or previews | **Avoid** | Apple 2.3.9 and Play's listing rules apply directly, and the earlier app was rejected for this. Screenshot mode exists for it. |
| Store listing text | **Low risk if factual** | Describe what the app does; avoid packing keywords with Pokémon trademarks (Apple 2.3.7); include the unofficial notice. |
| Marketing site artwork (`apps/marketing/src/images/screen.png`) | **Risk, lower stakes** | Same copyright issue as the apps, but no store review applies. A store reviewer may visit it if it's listed as the Marketing or Support URL. |
| PokeAPI's own requirements | **Fine** | Fair use policy asks for caching and reasonable request volume ([PokeAPI docs][pokeapi-docs]); SimpleDex syncs into Convex rather than calling PokeAPI from devices. |

**Unknowns:** whether The Pokémon Company has ever acted against PokeAPI or Pokédex apps outside GitHub; pokemon.com pages beyond its Terms of Use (blocked); the *New Kids on the Block* opinion's exact text; how either store treats Pokédex apps in practice (no primary source).

## Sources

All accessed November 7, 2026.

- [PokeAPI docs (Fair Use Policy, footer)][pokeapi-docs]
- [PokeAPI About][pokeapi-about]
- [PokeAPI/pokeapi LICENSE.md][pokeapi-licence]
- [PokeAPI/sprites README.md][sprites-readme]
- [PokeAPI/sprites LICENCE.txt][sprites-licence]
- [veekun/pokedex][veekun]
- [github/dmca notice archive][dmca]
- [2016 TPCi DMCA notice (pokereact)][dmca-2016]
- [2017 TPCi DMCA notice (PokiiMap)][dmca-2017]
- [The Pokémon Company International, Terms of Use][tpc-terms]
- [Nintendo Game Content Guidelines for Online Video & Image Sharing Platforms][nintendo]
- [*Feist Publications, Inc. v. Rural Telephone Service Co.*, 499 U.S. 340 (1991)][feist]
- [37 CFR 202.1, Material not subject to copyright][cfr]
- [*Hunley v. Instagram, LLC*, No. 22-15293 (9th Cir. July 17, 2023)][hunley]
- [Apple App Review Guidelines][apple]
- [Google Play Intellectual Property policy][play]

[pokeapi-docs]: https://pokeapi.co/docs/v2
[pokeapi-about]: https://pokeapi.co/about
[pokeapi-licence]: https://github.com/PokeAPI/pokeapi/blob/master/LICENSE.md
[sprites-readme]: https://github.com/PokeAPI/sprites/blob/master/README.md
[sprites-licence]: https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt
[veekun]: https://github.com/veekun/pokedex
[dmca]: https://github.com/github/dmca
[dmca-2016]: https://github.com/github/dmca/blob/master/2016/2016-03-07-Pokemon.md
[dmca-2017]: https://github.com/github/dmca/blob/master/2017/2017-03-09-pokiimap.md
[tpc-terms]: https://www.pokemon.com/us/terms-of-use/
[nintendo]: https://www.nintendo.co.jp/networkservice_guideline/en/index.html
[feist]: https://www.law.cornell.edu/supremecourt/text/499/340
[cfr]: https://www.ecfr.gov/current/title-37/chapter-II/subchapter-A/part-202/section-202.1
[hunley]: https://cdn.ca9.uscourts.gov/datastore/opinions/2023/07/17/22-15293.pdf
[apple]: https://developer.apple.com/app-store/review/guidelines/
[play]: https://support.google.com/googleplay/android-developer/answer/9888072
