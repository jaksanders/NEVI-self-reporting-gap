# Campaign Plan: NEVI Uptime Audit

## Objective, honestly stated

This piece builds credibility through demonstrated rigor, not reach. The network-level "check your own number against competitors" hook that would have driven company-by-company outreach and sharing doesn't exist in the data — that was ruled out during the build. What's left is a smaller, harder-to-argue-with claim: NEVI's self-reporting mechanism survived a year of litigation untouched, and there's currently no adequate public data to verify it. That claim earns credibility with people who value honest methodology over people looking for a splashy number. Plan around that, not around a viral outcome.

**Realistic goal:** a small number of high-quality engagements from people in the target roles below — a reply, a citation, an invitation to talk, a job-relevant conversation — not follower counts or traffic spikes.

## Who this actually serves, and what to lead with for each

**Policy/infrastructure journalists and analysts covering EV charging.** Best-fit audience for the piece as the evidence actually supports it. Lead with: "A federal self-reporting compliance mechanism just survived a year of litigation unchanged, and there's no independent way to check it." This is a citable, watchdog-style finding that doesn't need precise gap quantification to be useful to them.

**NEVI program administrators — state DOT compliance staff, FHWA policy staff.** Lead with the verification-gap finding, not a station-level number. Their job is assessing whether the compliance mechanism itself is sound; "the data to check this doesn't exist yet, and here's exactly why" is more useful to them than an imprecise gap estimate.

**Charging network reliability/data engineers (Electrify America, ChargePoint, EVgo, Tesla, etc.).** Hardest audience to land with the current data — the tool doesn't give them a network-specific number, which is what they'd actually want. Lead with the *methodology*, not the finding: the coverage-ratio check itself (what fraction of your state's fleet does a subset represent before you can attribute a state aggregate to it) is a reusable technique they might want to run on their own data. Don't oversell this angle; it's a secondary door-opener, not the main pitch.

## Pre-publish checklist

Publishing with known, unaddressed gaps undercuts exactly the credibility this plan depends on. Before pushing this out broadly:

1. Confirm the coverage-ratio caveat is visible in the live prototype itself, not just the article — a reader who only sees the tool shouldn't get more confidence than the article gives them.
2. Decide the OpenChargeMap framing (minor supporting data point vs. dropped entirely) and make the prototype and article consistent with each other.
3. Spot-check that all reference links in the article resolve (DOIs, FHWA PDF, Atlas EV Hub, ChargerHelp report) — do this right before publish, not now, since URLs can rot.
4. Re-confirm the live prototype URL is still the correct, unprotected production domain (Vercel occasionally reissues these on redeploy).

## Channels and tactics

**1. Personal site (jamesaksanders.com) — primary home.** Publish as a new post, same format as the two existing portfolio pieces (exec summary up top, code/data linked early, references at the end). Add it to the Portfolio page as a new tile — but note it's not a "MACHINE LEARNING MODEL" tile like the other two; consider a tile category like "DATA AUDIT" or "PUBLIC DATA INVESTIGATION" so it's not miscategorized next to the ML pieces and doesn't set the wrong expectation.

**2. LinkedIn — where your prior work has actually gotten pickup.** Post it yourself with a short, direct framing (2–3 sentences: the freeze/court context as the hook, the honest finding as the payoff, link to the prototype). Consider tagging or @-mentioning ChargerHelp, Paren, and the Beyond Uptime authors if identifiable — you cited their work directly, and a citation notice is a legitimate, low-pressure way to get their attention rather than cold outreach.

**3. Atlas EV Hub — direct pitch, strong fit.** Found during this research: their Weekly Digest covers NEVI guidance changes closely (they published the most detailed writeup of the August 2025 Interim Final Guidance I found), and their readership is largely the state DOT / policy audience this piece is best suited for. Their site lists an editorial contact (Daniel Wilkins, Weekly Digest author) — worth a direct, short pitch: "I built a public-data audit of whether NEVI's uptime self-reports are verifiable — thought your readers tracking NEVI compliance might find the coverage-ratio finding useful." Verify current contact details before sending, since staff/bylines change.

**4. ChargerHelp and Paren — professional courtesy outreach, not press pitch.** Both are cited directly and by name in the piece. A short note to each (via their published contact channels) letting them know their work was cited and linking the piece is standard professional courtesy, low-effort, and occasionally leads to real engagement — they may have their own view on the coverage-ratio finding worth hearing.

**5. Charging network outreach — narrower and lower-priority than originally planned.** Given the network-level view doesn't exist, don't pitch this as "see your number." If you want to reach specific people at Electrify America, ChargePoint, eVgo, or Tesla, target reliability/data-science roles specifically (search current titles on LinkedIn yourself — don't rely on stale org info) and frame it as methodology-sharing: "here's how I checked whether a state aggregate could be attributed to a subset of stations before trusting it — might be useful for auditing your own network's public listings." Treat this as a relationship-building move for future work, not a distribution channel expected to drive traffic.

**6. Skip or deprioritize:** Towards Data Science / Towards AI, which picked up your ML pieces — this one isn't an ML piece, and forcing that framing would be dishonest to the piece's actual content. Hacker News / r/dataisbeautiful are plausible longshots given the interactive prototype, but treat as opportunistic, not planned — post only if it clears the pre-publish checklist above and you're prepared for close technical scrutiny in the comments, since that audience will find the coverage-ratio issue faster than anyone.

## Timeline

- **Before publish:** clear the four-item checklist above.
- **Day 0:** publish on jamesaksanders.com, add portfolio tile, post to LinkedIn.
- **Day 0–2:** send the ChargerHelp/Paren courtesy notes and the Atlas EV Hub pitch while the piece is fresh.
- **Week 1–2:** if any of the above generates a reply, prioritize responding thoroughly over further distribution — a real conversation with one person at a target org is worth more than another posting channel.
- **No fixed follow-up date** for charging-network outreach — treat as ongoing/opportunistic rather than a campaign wave, since it's the weakest-fit audience right now.

## Success metrics, kept honest

- Any reply or engagement from ChargerHelp, Paren, Atlas EV Hub, or the Beyond Uptime authors — the people whose work is directly cited.
- Any inbound conversation (comment, LinkedIn message, email) from someone in a NEVI-compliance or charging-network-reliability role.
- Any citation or pickup by a policy/EV-industry publication.
- Traffic and share counts are secondary — track them, don't optimize for them.

## Risks

- **Overclaiming in the pitch copy.** Every outreach message should match the article's own honesty — don't let a LinkedIn caption imply a "gap" finding the article itself doesn't support. That's the fastest way to lose credibility with exactly the audience this is aimed at.
- **A technical reader finds the coverage-ratio issue before you've addressed it in the prototype.** This is why it's item 1 on the pre-publish checklist — better that the article gets there first.
- **Charging-network outreach reads as a pitch with nothing to offer.** Keep this channel low-key and methodology-framed, per the audience section above, rather than trying to force the original "see your number" angle back in.
