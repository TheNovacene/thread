# OneThread

**Tell it once.** A care record held by the young person it is about. Thread, for short.

When a child is hurt, or needs support, the adults who help arrive one at a time: a paramedic, a doctor, a physiotherapist, a teacher, a counsellor, a support worker. Each needs to know something. Each asks. The child, or the parent, becomes the only place the whole story lives.

Thread turns that round. The young person holds one record. Each professional scans a code and sees only the part they need. Every look is recorded. The hardest part, what happened, is written once and shared only with the people the young person chooses.

**Live demo:** https://onethread.uk (also at https://thenovacene.github.io/thread/)

This repository holds a working prototype and a proposal. It is not a live service. Everything in the example record is invented: the young person, the injury, the clinicians, the school. No real person's information is held anywhere in it.

## What the demo shows

| View | What it does |
| --- | --- |
| **Why** | The case for it: three ordinary moments, the numbers, why the window is open now, the principles. |
| **Sam** | The holder's view. Who sees what, by role. The record with provenance on every line. Review dates that turn amber then red. The access log. A real, revocable QR code. |
| **Scan** | The professional's view. Pick a role, sign in with the account you already use (NHS Care Identity, DfE Sign-in, a voucher), see only your slice. A break-glass emergency route that is logged and reported to the holder. |
| **How it fits** | What already exists, what Thread adds, line by line. Where it lands in policy. What it is not. The hard parts. |
| **The ask** | Who needs to say yes and to what. A twelve-month pilot path. The first three conversations. |

## The design in one paragraph

Thread adds three things that do not exist: consent by role that the person controls, an access log the person can read, and a code that points at the record without carrying it. Everything else is read from, or written to, systems the NHS and schools already run. Clinical lines (allergies, medicines, alerts) are read live from the GP record when the code is scanned, so there is no second copy to go stale. The person's own words are stored in the structure of the [PRSB About Me standard](https://standards.nhs.uk/published-standards/about-me) (v2.0.1), so a shared care record, a school or an EHC plan's Section A can take them unchanged.

## Standards and services it is built to sit on

| In Thread | Lives today in | What Thread does |
| --- | --- | --- |
| Identity | NHS login, NHS number, Personal Demographics Service | Uses them. Adds nothing. |
| Allergies, medication, alerts, injuries | GP record, Summary Care Record | Reads live through existing APIs (GP Connect, NHS App). Keeps no copy. |
| The person's own words | PRSB About Me, v2.0.1 | Stores them in that structure, heading for heading. |
| What is most important to me | EHC plan Section A; the child's views in the digital Individual Support Plan | Written once, exported rather than asked for again. |
| School plan | The school today; the digital ISP proposed in *Every Child Achieving and Thriving* (DfE, 23 February 2026) | Shows the school's plan to the roles the holder allows. The school stays the author. |
| Care team | The local shared care record | Lists the team as the shared care record holds it. |
| Finding the record in an emergency | National Record Locator | Registered as a record type, so an ambulance crew can reach the emergency slice from the NHS number. |
| Who is scanning | NHS Care Identity (CIS2), DfE Sign-in, GOV.UK One Login | Hands the professional to the sign-in they already use. Issues nothing of its own. |
| Consent by role, the access log, "told once" | Nothing | This is Thread's job. |

## Principles

- **The person holds it.** From sixteen the young person alone decides; before that, with a parent.
- **Nothing is copied that already exists.**
- **Every look leaves a trace**, including in an emergency.
- **Written once.** The account of what happened is shared by name only. Everyone else is told they do not need to ask.
- **Nobody's label.** Every child gets one at eleven. It is not a victims' record or a SEND record. It is a record.
- **Nobody profits from the data.** Intended to run as a community interest company or charity.

## What it is not

Not a new health record. Not a replacement for the ISP, the EHC plan or the shared care record. Not a messaging app. Not a decision-maker: it displays, it does not advise, score or predict.

## Paper sheets

The same record as printable A4 PDFs, one sheet per role, with the review dates on paper. They are in [`paper/`](paper/) and served from the site. The cover sheet explains how to use them and carries the tracking table that stands in for the access log.

- [All thirteen sheets in one PDF](https://onethread.uk/paper/onethread-paper-sheets-all.pdf) (22 pages)
- [How to use these sheets](https://onethread.uk/paper/onethread-sheet-00-how-to-use.pdf) (1 page)
- [Paramedic](https://onethread.uk/paper/onethread-sheet-01-paramedic.pdf) (1 page)
- [A&E doctor or nurse](https://onethread.uk/paper/onethread-sheet-02-aande-doctor-or-nurse.pdf) (2 pages)
- [GP](https://onethread.uk/paper/onethread-sheet-03-gp.pdf) (2 pages)
- [Pharmacist](https://onethread.uk/paper/onethread-sheet-04-pharmacist.pdf) (1 page)
- [Physiotherapist](https://onethread.uk/paper/onethread-sheet-05-physiotherapist.pdf) (2 pages)
- [CAMHS clinician](https://onethread.uk/paper/onethread-sheet-06-camhs-clinician.pdf) (2 pages)
- [School safeguarding lead](https://onethread.uk/paper/onethread-sheet-07-school-safeguarding-lead.pdf) (2 pages)
- [SENCO or SEND caseworker](https://onethread.uk/paper/onethread-sheet-08-senco-or-send-caseworker.pdf) (2 pages)
- [PE teacher or sports coach](https://onethread.uk/paper/onethread-sheet-09-pe-teacher-or-sports-coach.pdf) (1 page)
- [Youth or family support worker](https://onethread.uk/paper/onethread-sheet-10-youth-or-family-support-worker.pdf) (2 pages)
- [Named recovery coordinator](https://onethread.uk/paper/onethread-sheet-11-named-recovery-coordinator.pdf) (3 pages)
- [What happened, told once](https://onethread.uk/paper/onethread-sheet-12-what-happened-told-once.pdf) (1 page)

They are generated from the site's own data by `tools/build-sheets.js` (Node and Playwright), so paper and screen cannot drift apart. Regenerate with `node tools/build-sheets.js index.html paper`.

## Running it

It is a single file. Open `index.html` in a browser, or serve the folder with anything static. The QR library and the fonts load from public CDNs; without a network the page still works and shows the code's address as text instead of a QR image. The demo keeps its state (permissions, access log, issued code) in the browser's local storage; **Reset the demo** at the foot of Sam's view clears it.

## What we are asking for

If you are a paramedic, an A&E clinician, a GP, a pharmacist, a physiotherapist, a safeguarding lead, a SENCO, a CAMHS clinician or a youth worker, the most useful thing you can give is twenty minutes. Open the Scan view, pick your role, and tell us two things: **Would you scan it? What would you need to trust it?** Open an issue here, or get in touch.

If you work at the PRSB, in NHS or DfE digital teams, at an integrated care board or a Health Innovation Network, the **How it fits** and **The ask** views are written for you.

## Status

- Prototype, November 2026. Single-page, no backend, invented data.
- The paper version is published: thirteen A4 sheets, one per role, in `paper/`.
- The names OneThread and Thread are in use; a UK trade mark application is being prepared.

## Sources

- Department for Education, [Education, health and care plans: reporting year 2025](https://explore-education-statistics.service.gov.uk/find-statistics/education-health-and-care-plans/2025)
- Professional Record Standards Body, [About Me standard](https://standards.nhs.uk/published-standards/about-me)
- Department for Education, *Every Child Achieving and Thriving*, SEND white paper, 23 February 2026
- Department of Health and Social Care, *Fit for the Future: 10 Year Health Plan for England*, 3 July 2025
- NHS England, [National Record Locator](https://digital.nhs.uk/services/national-record-locator)

## Who holds it

Thread is held in stewardship by The Novacene Ltd for a public-benefit body to be formed, which will receive the name, mark, code and content for nominal consideration when it exists. The Novacene will grant no exclusive licence and will not sell any of it in the meantime. The full statement is in [`STEWARDSHIP.md`](STEWARDSHIP.md).

## Licence

Copyright © 2026 The Novacene Ltd, held in stewardship as described above.

- **Code** (`index.html` and anything else that runs) is licensed under the [GNU Affero General Public License v3.0](LICENSE). You may use, study, change and share it, including for public services. If you offer a modified version to others over a network, you must offer them the source of your modified version under the same licence.
- **Written content** (the words on the page, this README and the other documents here) is licensed under [Creative Commons Attribution-ShareAlike 4.0](LICENSE-CONTENT). Credit Thread, link back, and share what you build on it under the same terms.
- **The names "OneThread" and "Thread" and the thread mark** are not covered by either licence. Do not use them for a product or service that is not this one.
