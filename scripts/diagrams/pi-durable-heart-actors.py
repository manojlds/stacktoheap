"""Diagrams for src/content/blog/pi-durable-heart-actors.mdx. Run: python3 scripts/diagrams/pi-durable-heart-actors.py"""
from lib import *

# 1. An agent as an actor
b = ''
b += box(40, 225, 230, 110, "Messages", "Users, agents, timers")
b += step(155, 205, ["1. A message arrives"])
b += f'<rect x="400" y="40" width="640" height="680" rx="22" fill="#fff" stroke="{ACC}" stroke-width="5"/>'
b += f'<text x="430" y="92" font-size="30" font-weight="700" fill="{ACC}">Agent = actor<tspan dx="16" font-size="20" font-weight="400" fill="{GREY}">One owner, found by its key</tspan></text>'
b += panel(430, 120, 580, 262, "Mailbox", "Submissions", tcol=INK)
b += row(452, 186, 536, "hello", "done", "done")
b += row(452, 244, 536, "hello, same requestId", "dropped", "dropped")
b += row(452, 302, 536, "wait 40", "pending", "pending")
b += arrow("M270 280H422")
b += box(430, 480, 260, 112, "Storage", "Its own database")
b += box(750, 480, 260, 112, "Run", "Model and tools", stroke=ACC)
b += arrow("M880 382V472"); b += step(860, 424, ["2. One at", "a time"], "end")
b += arrow("M750 536H698"); b += step(720, 632, ["3. Commit"])
b += t(720, 688, "After a crash: reopen the storage and resume", 19, GREY)
b += box(1150, 400, 220, 104, "Other actors", "On any node")
b += box(1150, 580, 220, 104, "Timer", "Wakes it later")
b += arrow("M1010 510H1090V452H1142"); b += step(1260, 378, ["4. Send or create"])
b += arrow("M1010 560H1090V632H1142"); b += step(1260, 558, ["5. Sleep until"])
write("pi-durable-heart-actors-actor", 1400, 760, "An agent as an actor",
  "Messages from users, other agents and timers arrive in the agent's mailbox, its submissions. A repeated request ID is dropped. The agent takes one message at a time into a run of model and tools, commits to its own storage, and can send to or create other actors or sleep until a timer wakes it. After a crash it reopens the storage and resumes.", b)

# 2. The cluster
b = ''
b += box(40, 255, 230, 110, "Client", "Knows only the engine")
b += arrow("M270 310H432", "k"); b += step(351, 290, ["1. Ask by key"], col=INK)
b += f'<rect x="440" y="170" width="300" height="280" rx="18" fill="#fff" stroke="{ACC}" stroke-width="5"/>'
b += t(590, 222, "Rivet engine", 27, ACC, 700)
for i, s in enumerate(["Placement", "Routing", "Sleep and wakeups", "Each actor's SQLite"]):
    b += t(590, 270 + i * 40, s, 20, GREY)
for (y, name, agents) in ((50, "Worker n1", "bdf"), (350, "Worker n2", "ace")):
    b += panel(920, y, 440, 240, name, "A Node process")
    for i, a in enumerate(agents):
        b += chip(946 + i * 134, y + 110, a, "Harness")
    b += t(948, y + 92, "One actor per agent", 18, GREY, 400, "start")
b += arrow("M740 270H830V170H912"); b += arrow("M740 350H830V470H912")
b += step(835, 302, ["2. Route to", "its node"])
write("pi-durable-heart-actors-cluster", 1400, 640, "One engine, two workers",
  "A client asks the Rivet engine for an agent by key. The engine, which handles placement, routing, sleep and wakeups and keeps each actor's SQLite database, routes the call to the worker node holding that actor. Worker n1 holds agents b, d and f, and worker n2 holds a, c and e, each with its own harness.", b)

# 3. Kill and recover
b = ''
b += f'<rect x="500" y="40" width="400" height="130" rx="18" fill="#fff" stroke="{ACC}" stroke-width="5"/>'
b += t(700, 98, "Rivet engine", 27, ACC, 700) + t(700, 134, "Keeps the schedule and the database", 19, GREY)
b += panel(820, 380, 520, 270, "Worker n2", "Gone", fill="#fbf1ef", stroke=RED, tcol=RED, dash=True)
b += chip(850, 458, "a", "ticks 1-11", stroke=RED, col=RED, dash=True, w=150)
b += t(1030, 500, "$ kill -9", 22, RED, 700, "start", True)
b += step(1030, 540, ["2. The node dies", "in the middle of a run"], "start", RED)
b += panel(60, 380, 520, 270, "Worker n1", "Still running")
b += chip(90, 458, "a", "ticks 12-40", stroke=ACC, col=ACC, w=150)
b += step(266, 478, ["4. The harness reopens", "and reruns the safe tool"], "start")
b += step(266, 560, ["5. The tool reads its", "progress: next is 12"], "start")
b += arrow("M1080 372V105H908"); b += step(1102, 228, ["1. start arms a", "heartbeat, 20 s out"], "start")
b += arrow("M500 105H320V372"); b += step(342, 228, ["3. The heartbeat is due:", "start the actor here"], "start")
write("pi-durable-heart-actors-recovery", 1400, 700, "A node dies and the run continues",
  "Agent a on worker n2 arms a heartbeat with the Rivet engine, which keeps the schedule and the database. The node is killed after tick 11. When the heartbeat is due, the engine starts the actor on worker n1. The harness reopens and reruns the replay-safe tool, which reads its progress and continues from tick 12 to 40.", b)
