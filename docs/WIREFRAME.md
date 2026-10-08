# Pacific Softcom (PSC) landing page: wireframe

> **Status:** this is the original v1 wireframe the page was planned from. The
> v2 redesign kept its goals and conversion path but changed the layout. The
> live section order is now: Header, Hero (video, live bill countdown, call
> ticker), About (interactive system diagram), Brand marquee, Services (tabbed
> split view), Stats band, Savings calculator, Phones selector, Integrations
> orbit, Industries, Case studies (before/after viewer, which absorbed the old
> "case files" section), Phone company vs. PSC table, Pricing, Process timeline,
> Field notes, FAQ (with search), Contact / free bill review, Footer.

**Business:** Pacific Softcom Inc., Long Beach CA. Certified 3CX partner. 35 years in the telephone business, now installing IP phone systems, SIP trunks, hotel PMS integration and remote-office phones.
**Audience:** owners, office managers and IT leads at small and mid-size businesses with 5 to 100 phones, especially multi-site firms and hotels, who are paying too much to a phone company or hosted provider.
**Page job:** get the visitor to send in their current phone bill for a free review (form), or call 562-489-7760.
**Proof we can actually use:** three documented installs (The Padre Hotel, Pacific Sailing & Motor Yachts, BatchMaster), published hourly rates, 35 years in telephony.

Layout follows the Techin sample section by section. Content is mapped to PSC. Where the sample needs something PSC can't truthfully supply (staff photos, client quotes, a blog), the slot keeps its layout and gets true content instead.

---

## 0. Global chrome
```
[progress bar 3px, top]                                    [back-to-top ring, bottom right]
```
Objective: orientation on a long page.

## 1. Header (transparent over hero, sticky + solid on scroll)
```
[PSC logo, white]  Services  Phones  Pricing  Case studies  FAQ  Contact   ( 562-489-7760 (o) )  (≡ info)  [☰ mobile]
```
- The sample's search pill becomes a click-to-call pill. A one-page site has nothing to search, and the phone is the second conversion path.
- (≡ info) opens the off-canvas panel: logo, one-line pitch, address, email, phone.
- Objective: keep the phone number visible on every scroll position.

## 2. Hero (video background + dark overlay)  *matches sample layout*
```
┌────────────────────────────────────────────────────────────────────────┐
│ [video: patch panel, muted loop, cover]  + gradient overlay             │
│                                                                        │
│  [◐ Certified 3CX partner · Long Beach, CA]      ╱‾‾‾‾‾‾‾‾‾‾‾‾‾╲        │
│                                                ╱  slanted teal   ╲      │
│  Your phone system,                           │   capsule with    │     │
│  minus the phone                              │  ┌─────────────┐  │     │
│  company.                                     │  │ MONTHLY BILL│  │     │
│                                               │  │ before $360 │  │     │
│  Short paragraph (who we are, what we do)     │  │ after   $85 │  │     │
│                                               │  │   -76%      │  │     │
│  [ Get a free bill review ]                    ╲ └─────────────┘ ╱      │
│                                                  ╲_____________╱        │
└────────────────────────────────────────────────────────────────────────┘
```
- Signature element: the bill card. It is a real before/after from the Pacific Sailing case study, set like a printed telecom statement with a torn edge. It replaces the sample's stock portrait and states the offer in numbers.
- Objective: value in 5 seconds (lower bill, same or better phones) and one primary action.

## 3. About
```
┌───────────────┐          [◐ About PSC ◐]
│ photo (ports) │ ┌──┐     Telephone people first,
│               │ │35│     VoIP specialists second
│     ┌─────────┤ │yr│     paragraph: hotels, hospitals, call centers → 3CX, SIP, softphones
└─────┤ photo 2 │ └──┘     (✓) Certified 3CX partner   (☎) Phones arrive set up
      └─────────┘          [ See what we install ]  [☎ Talk to a technician 562-489-7760]
```
Objective: credibility. 35 years answers "who are these people?"

## 4. Platform strip (sample's logo slider)
```
(←)  [3CX] [Grandstream] [Cisco] [Aastra] [Sangoma] [Roommaster] [Salesforce] [Outlook]  (→)
```
Set as text wordmarks, not copied trademark logos. Objective: shows the gear and software PSC already works with.

## 5. Services (4 cards, curved aqua corner on hover)
```
[◐ What we install ◐]
Phone systems that cost less and do more
[3CX phone systems] [SIP trunking] [Hotel & PMS] [Remote offices & softphones]
  icon / title / 2 lines / [Ask about this] → preselects the service in the form
```
Objective: let each segment find itself. Every card CTA leads straight to the form.

## 6. Results counter + CTA band (dark, photo background)
```
[35+ years in telephony] [76% lower monthly bill*] [3 countries, one system*] [$0 calls between offices]
┌──────────────────────────────────────────────────────────────┐
│ [◐ Free bill review]  Paying the phone company too much?       [ Send us your bill ] │
└──────────────────────────────────────────────────────────────┘
```
*Numbers taken from the case studies, labelled with their source. Objective: proof, then the ask again.

## 7. Phones we provision (sample's team grid)
```
[◐ Phones we provision ◐]
Every phone arrives set up for your system
lead: phones bought online usually won't work; ours arrive upgraded, provisioned, with a guide
[phone illustration + aqua name plate] x4: GXP2100 / SPA504G / GXP2120 / Aastra 6757i
```
Objective: answer "can't I just buy phones on Amazon?" PSC has no staff photos, so this slot shows the hardware instead of invented people.

## 8. Pricing (teal top band, toggle)
```
[◐ Service rates ◐]  Straight hourly rates, no contract         ( 1 hour | 4 hours )
[Remote support $112.50]  [On-site visit $155.00 ★]  [New system: free review]
```
Rates are from PSC's current service page. Objective: removes the "what will support cost?" objection that most competitors hide.

## 9. How a switch-over works (4 numbered steps; real sequence, so numbers are earned)
```
01 Bill & line review   02 System design   03 Provision & install   04 Support
```
Objective: makes switching feel low risk.

## 10. Video + FAQ
```
┌───────────────────┐  [◐ FAQ ◐]
│ looping clip      │  Questions we hear before every install
│ (pause control)   │  ▸ Will my current phones work?
│                   │  ▸ Do I need a server?  ▸ Remote staff?  ▸ Slow internet?  ▸ Hotel PMS?
└───────────────────┘
```
Objective: objection handling just before the case studies and form.

## 11. Case studies (slider, arrows)
```
Real installs, real phone bills                                   (←)(→)
[photo / tag: Hospitality / The Padre Hotel ...  (→)]  [Multi-site ...] [International ...]
   → opens a dialog: the problem / what we did / result / equipment list
```
Objective: specific proof with names, places and dollar figures.

## 12. Appointment form + contact
```
┌──────────────────────┐   [◐ Contact ◐]
│ [◐ Free review ◐]     │   Talk to a person who installs phones
│ Book a free phone     │   short text
│ bill review           │   [☎] 562-489-7760
│ name / email / phone  │   [@] PSC@Pacificsoftcom.com
│ service / # of phones │   [⌖] 4712 East 2nd Street #831, Long Beach, CA 90803
│ message               │
│ [ Request my review ] │
└──────────────────────┘
```
Visible labels, 6 fields, of which only 3 are required. Objective: the conversion.

## 13. From the case files (sample's testimonial slider)
Short outcome cards, each tied to a named case study. They are not written as quotes: PSC has no published testimonials, so these slots hold facts until real quotes are collected.

## 14. Field notes (sample's blog grid)
3 cards made from PSC's own hardware advice: PoE switches, IP paging horns, pre-provisioned phones. Each card expands in place.
Objective: shows expertise and answers spec-level questions without a blog.

## 15. Footer (teal)
```
[logo] blurb  [phone field][Call me back]
Quick links | Services | Works with (tile grid)
[aqua bar: address · email · phone]
© 2026 Pacific Softcom Inc.
```
