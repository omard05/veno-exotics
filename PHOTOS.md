# Photo spots (C1–C19)

Every place that will show a car photo is a gray box labeled with a number.
Open the website and you'll see the number right where the photo goes.

| Slot | Where it is |
| --- | --- |
| C1 | Home: full-screen background at the very top |
| C2 | Mercedes-Maybach GLS 600: main photo (home, fleet, vehicle page) |
| C3 | BMW M3 (G80): main photo |
| C4 | BMW M4 (G82): main photo |
| C5 | Home: November offer banner background |
| C6 | Home: "Every reservation, personally reviewed" background |
| C7 | Home: bottom "Your next drive starts here" background |
| C8 | Specials page header background |
| C9 | Our Fleet page header background |
| C10 | Experiences page header background |
| C11 | Consignment page header background |
| C12 | Brokers page header background |
| C13 | About Us page header background |
| C14 | Contact page header background |
| C15 | Reserve (booking) page header background |
| C16–C19 | Experiences page: one photo per experience, in order |

## How to add a photo
1. Copy the image into the `public/images/` folder (for example `public/images/c1.jpg`).
2. Open `src/lib/photos.ts` and type the path next to its slot: `C1: "/images/c1.jpg",`
3. Save. The gray box turns into your photo.

Use wide landscape photos, at least 2000 pixels wide, for backgrounds.
Or just tell Claude "here's the photo for C1" and attach it.
