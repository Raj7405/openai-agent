# OpenAI Agents SDK — Notes

## Core Concepts

### Agents

Agents are the main building block of the OpenAI Agents SDK. An Agent is a Large Language Model (LLM) configured with:

- **Instructions** — the system prompt that tells the model who it is and how it should respond
- **Model** — which OpenAI model to call, plus any optional model tuning parameters
- **Tools** — a list of functions or APIs the LLM can invoke to accomplish a task

### Tools

Tools let an Agent take actions — fetch data, call external APIs, execute code, or even use a computer.

### OutputType

Use `OutputType` to tell the agent which format to return. By default, agent output is a string. You can transform it into a required format by providing a schema object on the agent class.

---

## Multi-Agent System Design

Build scalable AI agent systems by distributing work among specialized agents rather than relying on a single "do-it-all" agent.

### Specialization Principle

Each agent should focus on a single, specific task for maximum efficiency. Avoid agents that try to handle everything.

### Agent Definition

An agent is defined by its **instructions**, **tools**, and **name**.

---

## Multi-Agent Patterns

### Manager Pattern (Agent as a Tool)

A central **Manager** agent owns the conversation and acts as the interface for the user.

- Invokes specialized agents (e.g., Refund or Billing) as if they were standard tools via `.asTool()`
- Retains control and summarizes the final response for the user
- The user only ever interacts with the manager, which delegates tasks internally

#### Practical Implementation

1. **Agent setup** — Create separate instances (e.g., `SalesAgent` and `RefundAgent`) with unique instructions.
2. **Composition** — Attach specialized agents to the manager using `.asTool()`.
3. **Transparency** — Use OpenAI platform traces to visualize how the manager calls specialized agents and receives data back.
4. **Data handling** — Use tools for specific actions (e.g., `processRefund` using fs or a database) that the specialized agent executes when invoked.

### Handoff Pattern

The initial agent identifies the user's intent and completely delegates (transfers) the conversation and control to a specialized agent. The user continues interacting directly with the new agent — like being routed to a specific department.

#### Implementing Agent Handoffs

Design a system where agents can communicate their capabilities to each other:

| Role | Responsibility |
|------|----------------|
| **Reception Agent** | Primary point of contact; understands the request and routes to the correct specialist |
| **Specialist Agents** | Solve specific problems (e.g., Sales Agent for product inquiries, Refund Agent for customer support) |
| **Handoff Configuration** | Explicitly define available handoff targets for the reception agent |

#### Best Practices for Reliability

Even with correct setup, LLMs may sometimes fail to hand off tasks correctly. To improve reliability:

- **Use the "handoff" keyword** — Include the word "handoff" in system instructions. Without it, the model may try to resolve the request itself instead of transferring.
- **Provide handoff descriptions** — Give brief context for each handoff target so the agent knows *when* to choose that specialist.
- **Use recommended prefixes** — The SDK provides `recommended_prompt_prefix`. Including it in system instructions helps the model understand the transfer protocol and reduces hallucinations and refusal errors.

### Manager vs. Handoff — Quick Comparison

| | Manager Pattern | Handoff Pattern |
|---|----------------|-----------------|
| User interacts with | Manager only | Specialist after transfer |
| Control | Manager retains it | Transferred to specialist |
| Agent relationship | Specialist used as a tool | Conversation redirected entirely |

---

## Why Handoffs Matter

Handoffs enable cleaner code and more focused agents. Instead of one massive agent that knows everything, you build a collection of smaller, efficient agents — each focused on a single task — making your system easier to maintain, test, and scale.
