#!/usr/bin/env python3
"""
Idempotent demo seed script for Written Monolith.
Populates Alice (author) and Bob (reader/commenter), sample essays, drafts, and threaded comments.
"""
from datetime import datetime, timezone
from sqlalchemy import func
from app.database import engine, SessionLocal, Base
from app.models import User, Post, Comment
from app.auth.security import get_password_hash
from app.utils.slug import generate_unique_slug
from app.utils.excerpt import build_excerpt

POSTS_DATA = [
    {
        "title": "Microservices Without the Circus",
        "status": "published",
        "excerpt": "A service boundary is a promise about ownership. Get the promise right and the diagrams take care of themselves.",
        "content": """There is a moment in every growing codebase when someone opens a diagram and says: "What if we split this up?" It is usually followed by a conference talk and a very long quarter.

Microservices are not a maturity badge. They are a way of making ownership explicit. When a service owns its data, its deploy, and its failure modes, the architecture starts to match the way the organization actually changes.

## Start with seams, not servers

A seam is a place where the data and the decisions already change together. It is not a folder. It is not a layer. It is a boundary that lets one team move without asking another team for permission.

Three useful tests for a real seam:

- One team can change the service without coordinating a release with everyone else.
- The service can fail without taking the whole product down.
- Its data has a single owner, even if other services need a copy.

If two "services" always deploy together and share a database, you have built a distributed monolith with more YAML.

## The unglamorous middle

Most of production is not request routing. It is timeouts, retries, idempotency, and deciding what to do when a dependency is slow. A service call without a deadline is an outage waiting for a quiet afternoon.

The useful pattern is boring on purpose:

1. Give every call a timeout.
2. Retry only operations that are safe to retry.
3. Cache reference data for a short window.
4. Degrade when you can: an essay with an unknown author still reads better than an error page.

> The goal is not more services. The goal is fewer reasons for every deploy to be scary.

## What this small blog does

This demo separates users, posts, and comments into a coherent domain. Each table maintains clear foreign keys. The API exposes authenticated and public routes with robust pagination and moderation.

That is the circus worth avoiding: not the number of services, but the number of surprises.""",
    },
    {
        "title": "The Quiet Power of Writing Things Down",
        "status": "published",
        "excerpt": "Most of the value of writing happens before anyone reads it. The page is a place to find out what you actually think.",
        "content": """Most of the value of writing happens before anyone reads it. The page is a place to find out what you actually think.

We tend to treat writing as a broadcast. A post, a memo, a launch note. But the useful part is often the private part: the sentence you have to delete because it turns out you do not believe it.

## A decision log is a time machine

Six months from now, the reasoning behind a choice will be gone. The code will remain. It will look either obvious or insane, and no one will remember which.

A short decision note fixes this. It does not need a template. Three lines are enough:

- What we decided.
- What we were optimizing for.
- What would make us revisit it.

> Write for the person who will inherit the decision, including your future self.

## Lower the bar

The blank page is intimidating because we confuse writing with publishing. They are different activities. A note can be ugly. A draft can contradict itself. That is what drafts are for.

Try writing the version you would send to a smart colleague in a chat message. No preamble, no throat-clearing. Just the thing you noticed, and why it matters.

## Keep the receipts

The archive matters more than any single piece. A folder of small observations becomes a map of how your thinking changed. When a problem returns, you do not start from zero. You start from the last honest attempt.

Writing is not a performance of certainty. It is a practice of paying attention, then leaving a trail.""",
    },
    {
        "title": "Designing for the Second Year",
        "status": "published",
        "excerpt": "Launch day is a poor test of a product. The second year is made of ordinary Tuesdays, undocumented edge cases, and someone else's hands.",
        "content": """Launch day is a poor test of a product. Everyone is watching, the critical paths are rehearsed, and there is a small army of people who know exactly why the third button is disabled.

The second year is different. It is made of ordinary Tuesdays, undocumented edge cases, and someone else's hands.

## The second year is made of Tuesdays

By then, the original team has changed. The person who knows why the billing job runs at 03:17 is on holiday. A customer has found a path through the product that no one designed, and it is now load-bearing.

Designing for that year means optimizing for legibility rather than cleverness. A boring solution that a new person can trace is usually worth more than an elegant one that only its author can explain.

Some questions worth asking early:

- Can a new person find the owner of this behavior in under five minutes?
- Does the error message tell someone what to do next?
- Is the data model explained anywhere outside the author's head?
- Can we remove this feature without a archaeology project?

## Maintenance is a design material

We tend to treat maintenance as the sad aftermath of building. It is actually part of the material. The shape of the seams, the names of the tables, the number of steps between an alert and a fix — all of it is design work.

> A product is not finished when it ships. It is finished when the next person can carry it.

## Leave a little room

The second year also needs space for surprise. Leave a margin in the schema, in the budget, in the roadmap. Not because you know what is coming, but because you know something is.

Design for the person who arrives after you. They are the real user of your architecture.""",
    },
    {
        "title": "A Field Guide to Slow Mornings",
        "status": "published",
        "excerpt": "Not every morning needs to be optimized. Some of the best ones begin with a window, a warm cup, and no particular plan.",
        "content": """Not every morning needs to be optimized. Some of the best ones begin with a window, a warm cup, and no particular plan.

The productivity industry has convinced us that the first hour of the day is a resource to be extracted. In practice, it is often the only hour that belongs to us. Spending it on a dashboard feels like a poor trade.

## Three small rituals

- Open the window before opening the laptop. Let the room remember that there is an outside.
- Read one thing slowly. A page, not a feed. Something that was edited by a person.
- Write three sentences about what you noticed. Not what you plan to do.

None of this is a system. That is the point. A ritual is useful because it is repeatable without becoming a project.

## The defence of unmeasured time

There is a particular kind of guilt that comes from doing something that cannot be graphed. A slow breakfast does not have a KPI. A walk without a podcast does not produce a summary.

> The morning is not a runway. It is part of the day.

## Start smaller than you think

If a slow morning sounds impossible, try a slow ten minutes. Make the coffee without checking your phone. Sit down. Look out of the window. That is enough to change the temperature of the day.

The goal is not to become a different person. It is to notice the one you already are, before the notifications arrive.""",
    },
    {
        "title": "What Production Actually Teaches You",
        "status": "published",
        "excerpt": "Staging is a rehearsal. Production is the performance, with real weather and no understudy. Most lessons arrive at an inconvenient hour.",
        "content": """Staging is a rehearsal. Production is the performance, with real weather and no understudy. Most lessons arrive at an inconvenient hour.

The first thing production teaches is humility about inputs. Real users paste emoji into phone fields, open six tabs of the same checkout, and return to a page three weeks later with a stale token. Your types were correct. Your assumptions were not.

## The failures are boring

The dramatic outage gets the postmortem. The more common failure is quieter: a retry storm that makes a slow dependency slower, a cache that serves yesterday's permissions, a count that drifts by one every time a job restarts.

## What to do about it

The useful response is not more ceremony. It is a shorter feedback loop between what you believe and what the system can prove.

- Make health checks check the thing that actually breaks.
- Put request ids on every log line and return them to the client.
- Prefer idempotent writes when the network is allowed to be uncertain.
- Write down the recovery procedure while the incident is fresh.

> Production does not care how elegant the diagram is. It cares whether the pager has a next step.

## Keep a little kindness

The person debugging at 2am is usually doing their best with incomplete information. A system that surfaces the right context is an act of kindness as much as engineering.""",
    },
    {
        "title": "Notes on Boring Technology",
        "status": "draft",
        "excerpt": "A working draft about choosing tools that will still make sense when the excitement wears off.",
        "content": """This is a draft. It will change.

The case for boring technology is not that new things are bad. It is that novelty has a maintenance cost, and most products do not have the budget to pay it twice.

## Things worth writing down

- What problem did the exciting choice solve that the boring one could not?
- Who will operate it on a quiet Tuesday?
- What is the exit plan if the project loses its maintainer?

## A possible ending

The best tool is often the one your team can explain to a new colleague over coffee. Not because it is the most capable, but because the explanation fits in one sitting.""",
    },
]

COMMENT_TARGETS = [
    {
        "postTitle": "Microservices Without the Circus",
        "comments": [
            {
                "author": "bob",
                "content": "The point about seams is the one I keep relearning. We split by team org chart and paid for it for a year. The boundaries looked clean in the diagram and were a mess in the data.",
                "replies": [
                    {
                        "author": "alice",
                        "content": "The org chart is a signal, not the boundary itself. If two services always change together, the seam is not real yet — it is just a distributed folder.",
                    },
                ],
            },
            {
                "author": "bob",
                "content": "Would love a follow-up on what reference data you allow services to copy versus look up live. That is where our cache invalidation stories get interesting.",
            },
        ],
    },
    {
        "postTitle": "The Quiet Power of Writing Things Down",
        "comments": [
            {
                "author": "bob",
                "content": "The 'write for the person who inherits the decision' line is going on a sticky note. I have spent too many afternoons archaeology-ing my own past choices.",
                "replies": [
                    {
                        "author": "alice",
                        "content": "The future self is the harshest reader. A three-line decision note has saved me from repeating the same mistake twice — which is about my average.",
                    },
                ],
            },
        ],
    },
    {
        "postTitle": "Designing for the Second Year",
        "comments": [
            {
                "author": "bob",
                "content": "The Friday change test is a good one. We started asking 'would we be comfortable shipping this before a long weekend?' and it changed the size of our changes almost immediately.",
            },
        ],
    },
]

def seed():
    print("Ensuring database schema exists...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding accounts...")
        # Alice (Author)
        alice = db.query(User).filter(User.email == "alice@example.com").first()
        if not alice:
            alice = User(
                name="Alice Mercer",
                email="alice@example.com",
                password_hash=get_password_hash("Password123!"),
                bio="Writer, systems engineer, and amateur bookbinder. Writing about software architecture and team ergonomics.",
                avatar_url=None,
            )
            db.add(alice)
            db.commit()
            db.refresh(alice)
            print("  + Created Alice Mercer (alice@example.com)")
        else:
            print("  = Existing Alice Mercer")

        # Bob (Reader/Commenter)
        bob = db.query(User).filter(User.email == "bob@example.com").first()
        if not bob:
            bob = User(
                name="Bob Chen",
                email="bob@example.com",
                password_hash=get_password_hash("Password123!"),
                bio="Product designer and avid reader. Curious about how people make things together.",
                avatar_url=None,
            )
            db.add(bob)
            db.commit()
            db.refresh(bob)
            print("  + Created Bob Chen (bob@example.com)")
        else:
            print("  = Existing Bob Chen")

        users_by_handle = {"alice": alice, "bob": bob}

        print("Seeding essays...")
        post_map = {}
        for p in POSTS_DATA:
            existing = db.query(Post).filter(Post.title == p["title"]).first()
            if not existing:
                slug = generate_unique_slug(db, p["title"])
                pub_at = datetime.now(timezone.utc) if p["status"] == "published" else None
                new_post = Post(
                    author_id=alice.id,
                    title=p["title"],
                    slug=slug,
                    excerpt=p["excerpt"],
                    content=p["content"],
                    status=p["status"],
                    published_at=pub_at,
                    comment_count=0,
                )
                db.add(new_post)
                db.commit()
                db.refresh(new_post)
                post_map[p["title"]] = new_post
                print(f"  + Created post: {p['title']}")
            else:
                post_map[p["title"]] = existing
                print(f"  = Existing post: {p['title']}")

        print("Seeding comments...")
        for target in COMMENT_TARGETS:
            post = post_map.get(target["postTitle"])
            if not post or post.status != "published":
                continue

            # Check if comments already exist for this post
            existing_count = db.query(Comment).filter(Comment.post_id == post.id).count()
            if existing_count > 0:
                print(f"  = Comments already seeded for '{post.title}'")
                continue

            for c_data in target["comments"]:
                c_user = users_by_handle[c_data["author"]]
                comment = Comment(
                    post_id=post.id,
                    author_id=c_user.id,
                    parent_id=None,
                    content=c_data["content"],
                )
                db.add(comment)
                db.commit()
                db.refresh(comment)

                if "replies" in c_data:
                    for r_data in c_data["replies"]:
                        r_user = users_by_handle[r_data["author"]]
                        reply = Comment(
                            post_id=post.id,
                            author_id=r_user.id,
                            parent_id=comment.id,
                            content=r_data["content"],
                        )
                        db.add(reply)
                        db.commit()

            # Update accurate count
            total_comments = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar() or 0
            post.comment_count = total_comments
            db.commit()
            print(f"  + Seeded {total_comments} comments for '{post.title}'")

        print("Seed completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
