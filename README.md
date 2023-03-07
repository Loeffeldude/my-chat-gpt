# MyChatGPT

This is a OSS standalone ChatGPT client. It is based on [ChatGPT](https://openai.com/blog/chatgpt).

The client works almost just like the original ChatGPT websites but it includes some additional features.

## Installation

Go to the [realease page]() and download and install the latest release for your platform.

## Setup

1. Head over to the settings and enter your OpenAI API key. You can get one [here](https://platform.openai.com/account/api-keys).

2. Choose a preamble. A basic default preamble is already set. You can change it to something more specific to your use case.

3. Start Chatting!

---

<br>

## Why?

I wanted to use ChatGPT but I didn't want to pay a fixed price if I have days where I barely use it. So I created this client that almost works like the original.

The 20 dollar price tag on ChatGPT is a bit steep for me. I don't want to pay for a service I don't use. I also don't want to pay for a service that I use only a few times a month. Even with relatively high usage this client is much cheaper.

### Pricing Comparison:

A ChatGPT conversation can hold 4096 tokens (about 1000 words). The ChatGPT API charges `0.002$` per 1k tokens.

Every message needs the entire conversation context. So if you have a long conversation with ChatGPT you pay about `0.008$` per message. ChatGPT needs to send 2500 (messages with full conversation context) a month to pay the same as the ChatGPT subscription.

You can delete previous messages with this client if they are no longer needed for the context. So you can have a lot more messages for the same price.

## Features

### Pay as you go.

You use your own API key and pay for the usage this turns out to be much cheaper than the original ChatGPT website with moderate usage.

### More customization.

You can change the models behaior by changing the preamble. You can use this to create more customized chatbots.

### Edit the chat history.

You can edit the chat history and the model will continue the conversation from the edited point.

### Mark messages as important.

You can mark messages as important. Important messages will never be dropped from the conversation. (The model still has a token limit all not important messages will be dropped if the conversation gets too long.)

### No annoying login flow.

You can use the client without having to login to OpenAI.

---

## Development

This is just a React app with an Electron wrapper.

Building is done with Vite.

Fork this repo and start hacking. Feel free to open a PR if you want to contribute.

### Setup

```bash
npm install
```

### Run

```bash
npm run dev
```

### Build

Build the electron app:

```bash
npm run build:electron
```

Just build React app:

```bash
npm run build:client
```
