# Third-party assets

These assets are redistributed here under their own licences, which are kept
beside this file. They are not covered by the MIT licence of this repository.

| Asset | Used for | Licence | Source |
| --- | --- | --- | --- |
| Cubic 11 (俐方體十一號) | Traditional Chinese | SIL Open Font License 1.1 | https://github.com/ACh-K/Cubic-11 |
| Departure Mono | Latin, digits, punctuation | MIT | https://github.com/rektdeckard/departure-mono |
| Simple Pixel Cursors by Gabl | Website pointer and link cursors | CC0 1.0 Universal | https://gabl18.itch.io/simple-pixel-cursors |

`make fonts` refetches Cubic 11. Departure Mono ships only in a release
archive, so it is updated by hand:

```sh
curl -LO https://github.com/rektdeckard/departure-mono/releases/latest/download/DepartureMono-1.500.zip
unzip -j DepartureMono-1.500.zip '*/DepartureMono-Regular.woff2' -d source/fonts/
```
