---
title: AI Agents
date: 2025-05-12
description: A simple way to think about what AI agents are, what they do, and why getting them to work reliably is hard.
cover: featured-landscape.webp
---

I’ve been working with AI agents a lot lately. Some people are confused what an agent really is, here’s how I think about it.

At its most basic, an agent is an LLM prompt and a set of tools it can call autonomously. The agent has instructions, like “You are a helpful support representative” and a set of tools such as looking up documentation, or a web search. When the agent receives a prompt, it can call its tools as needed, and when it is finished, it returns a response.

This is really just a series of LLM calls. Here’s what that might look like:

User: “What is your refund policy?”

Agent:

- sends user prompt plus instructions to an LLM (like Claude)
- gets response to call docs lookup tool
- calls docs lookup, gets a doc on refund policy
- sends refund policy doc plus conversation history back to LLM
- gets response to synthesize an answer
- calls answer tool, indicates it is finished, and a response is returned to the user: “Our refund policy is…”

It can get much more complex than this, but the basic idea is that it has some stuff it can do, and it uses an LLM to tell it what to do next each step of the way.

The hard part with agents is getting them to do something useful, reliably, in a reasonable amount of time. The next hard part is getting multiple agents to work together to do something useful, reliably, in a reasonable amount of time.
