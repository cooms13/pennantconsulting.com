# Sweet Meteor of Death Site Update Guide

This site is set up so you only need to edit one file:

- content.js

## 1) Update Tour Dates

Open content.js and find the shows section.

Each show looks like this:

{
  date: "DEC 06",
  venue: "Neon Cemetery Fest",
  city: "Seattle, WA",
  ctaText: "Tickets",
  ctaLink: "#contact"
}

To add another show, copy one block, paste it below, and change text.

## 2) Update Gallery Images

Put image files into the pictures folder.

- Folder: pictures/
- Supported types: .jpg, .jpeg, .png, .webp, .gif, .svg

The gallery now auto-loads images from that folder.

In content.js, keep these settings turned on:

galleryAutoFromPictures: true
galleryDirectoryPath: "pictures/"

Optional: if no files are found in pictures/, it falls back to the manual gallery list in content.js.

Manual fallback list is still in content.js under gallery.

## 2b) Update Hero Background Photos

Put hero photos into the pictures-hero folder.

- Folder: pictures-hero/
- The hero rotates one image at a time automatically.
- Photos fade in and hover behind the meteors.

Optional settings in content.js:

- heroAutoFromPictures: true
- heroDirectoryPath: "pictures-hero/"
- heroCycleMs: 5200

Each image looks like this:

{
  src: "https://...",
  alt: "Band performing on stage"
}

You can use:
- direct image links (https://...)
- local files like media/photo1.jpg

Tip: If you use local files, create a media folder and place images there.

## 3) Add Videos or Music Embeds

In content.js, find media.

Each media item has embedHtml.

Example YouTube embed:

embedHtml: '<iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Live video" allowfullscreen></iframe>'

If embedHtml is empty, a placeholder box appears.

### Videos section (YouTube)

In content.js, use the videos array.

Each item can use a normal YouTube URL:

{
  title: "Live Clip",
  description: "Short description",
  youtubeUrl: "https://www.youtube.com/watch?v=VIDEO_ID"
}

Also works with:
- https://youtu.be/VIDEO_ID
- https://www.youtube.com/embed/VIDEO_ID

If you prefer, you can still use embedHtml directly.

## 4) Update Merch

In content.js, find merch.

Each merch item looks like this:

{
  name: "Meteor Skull Tee",
  description: "Black print, white ink, all sizes.",
  ctaText: "Buy",
  ctaLink: "https://your-shop-link.com"
}

## 5) Preview the Site

Open index.html in a browser.

For best results, run a local server:

python3 -m http.server 8000

Then open:

http://localhost:8000

## 6) What not to edit

Avoid editing index.html unless you want layout/design changes.
Regular updates should only happen in content.js.
