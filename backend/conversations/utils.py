import os
import anthropic
from openai import OpenAI
from groq import Groq


def build_context(bot, conversation):
    system = bot.system_prompt
    docs   = bot.documents.filter(status="done")
    if docs.exists():
        knowledge = "\n\n".join([
            f"--- Document : {doc.filename} ---\n{doc.content[:2000]}"
            for doc in docs
        ])
        system += f"\n\nVoici ta base de connaissances :\n{knowledge}"
    history  = conversation.messages.all()
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history
    ]
    return system, messages


def call_claude(system, messages, user_message):
    client   = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    response = client.messages.create(
        model      = "claude-haiku-4-5-20251001",
        max_tokens = 1024,
        system     = system,
        messages   = messages + [{"role": "user", "content": user_message}]
    )
    return response.content[0].text


def call_gpt(system, messages, user_message):
    client   = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model    = "gpt-4o",
        messages = [{"role": "system", "content": system}]
                   + messages
                   + [{"role": "user", "content": user_message}]
    )
    return response.choices[0].message.content


def call_groq(system, messages, user_message):
    client   = Groq(api_key=os.getenv("GROQ_API_KEY"))
    response = client.chat.completions.create(
        model    = "llama3-8b-8192",
        messages = [{"role": "system", "content": system}]
                   + messages
                   + [{"role": "user", "content": user_message}]
    )
    return response.choices[0].message.content


def get_ai_response(bot, conversation, user_message):
    system, messages = build_context(bot, conversation)
    return call_groq(system, messages, user_message)