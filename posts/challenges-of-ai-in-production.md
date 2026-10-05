---
title: "Challenges of AI in production"
date: "2024-03-13"
description: "Building a demo app with an LLM is easy, because you don’t need it to work perfectly."
originalUrl: "https://scottbolinger.com/challenges-of-ai-in-production/"
originalSource: "scottbolinger.com"
---

Building a demo app with an LLM is easy, because you don’t need it to work perfectly.

What happens when it goes to production and 10-20% of the time the LLM hallucinates or provides an incorrect response? As we’ve seen in the headlines, this is unacceptable.

![](../assets/challenges-of-ai-in-production-01.webp)
![](../assets/challenges-of-ai-in-production-02.webp)

LLMs are probabilistic, not deterministic, meaning they can give different results for the exact same inputs. This can be very stressful for live demos and customer chatbots.

Even responses that are not completely wrong can have legal ramifications. Consider an AI assistant that helps you write articles. If an AI-assisted article is published that contains slander, is the company liable for that? What about bias or factually misleading information? Or recommending pricing that causes a negative business impact? These questions have not been answered in the courts yet, I’m sure they will be soon.

Even with all these issues, we are starting to see the huge positive impacts AI can have.

![](../assets/challenges-of-ai-in-production-03.webp)

Many companies are willing to take some risk to get this potentially huge upside. Here are some ways to potentially mitigate production AI issues to escape bad press.

## Restrictions, restrictions, restrictions

Production AI chatbots must be saddled with all kinds of restrictions to avoid these types of issues. For example:

- System prompt – tell it what it can and can’t do
- Verification – check each prompt for validity
- Functions – force it to take certain actions
- Moderation – check for inappropriate prompts/responses
- Guardrails – keep things on topic

Each of these items has to be carefully constructed so it doesn’t allow bad outputs, but also isn’t overly restrictive. There’s a lot of trial and error here.

### Restrictive System Prompt

If I was building a new AI Assistant, I would start with a system prompt like this: “You are a helpful assistant for X company. You are allowed to answer questions about X company, relating to X topics. If the question is not related to X topics, say I can’t help with that.”

This is a good start, but it will not solve all your problems.

### Verify Each Prompt

You’re still vulnerable to malicious prompts like “ignore all previous instructions and do something bad.” To solve that you can use the LLM to verify the user prompt before responding: “I’d like you to evaluate this prompt, make sure it is related to X topic, and is not related to ABC. Respond with approve or reject based on these instructions.”

That is better, but still not bullet proof. You still have the problem of the model hallucinating answers for important topics like refunds, as we saw with Air Canada.

### Restricting to Functions

One thing I’ve found useful is to not let the model respond using it’s own knowledge base at all, only allow it to use [functions or tools](https://platform.openai.com/docs/guides/function-calling).

You can define a function for getting company documentation, and only let the model use that to answer questions. Using [RAG](https://blogs.nvidia.com/blog/what-is-retrieval-augmented-generation/), you get relevant document chunks, and tell the model to use that to answer any questions. Don’t let it make up an answer, tell it to only use the information provided.

This may be overly restrictive in some cases, but functions allow you to make the model responses a bit more deterministic.

### Moderation

Most LLM providers provide built-in moderation, such as OpenAI, which you can augment if needed. Frameworks like [NVIDIA’s NeMo-guardrails](https://github.com/NVIDIA/NeMo-Guardrails) offer more fine-grained tuning to keep your chats on topic and away from trouble.

### Testing

Going to production with an AI assistant involves lots of testing, watching logs, and maybe some prayers. Small changes to any of the variables above can completely change outcomes, so it’s important to try a lot of tweaks and improve iteratively.

This is a very new technology so most companies are figuring it out as they go, it will be an exciting space to watch.
