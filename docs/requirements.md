# :space_invader: Required software you will need to install

Before getting started working on a <SmileText/> project you will need to
install a few items on your local computer.

:::warning First time setting Smile up for a new lab?

This guide (and most of the docs) assumes you have set up a base repo of Smile
for your lab. If you need to set up a base repo please follow
[this guide](/labconfig) first. If you are not sure if you'd like to use this
project you can continue reading to learn more.

:::

## 1. Install the latest Node.js

You will need to install Node.js on your computer if you haven't already. You
can download the latest version [here](https://nodejs.org/en/download/). After
the install completes, verify that you have the `npm` command in your terminal
program of choice. If you already have Node installed verify that the version of
npm is greater than or equal to 10.9.2. You can check your installed version by
typing `npm -v`.

## 2. Create a GitHub account if you haven't and install the command-line tool

You will also need a [GitHub account](https://github.com/join) (a free account
is fine). Tell the main Smile coordinator for your lab your username so they can
add you as a member of the lab's Github organization.

Next make sure you have the GitHub Command Line Interface (cli) tool installed:
[download it here](https://cli.github.com) using the installer or homebrew.

Next, allow the CLI access to your GitHub account by typing:

```
gh auth login --web
```

into your terminal program. This will open your default browser and ask you to
log in to GitHub.

## 3. Request access to the shared database resources

Later you will want to customize the configuration of your application, but to
begin with you will want to simply decrypt the pre-configured files provided in
the repository.

::: info Great news!

You only need to do this the first time you try out <SmileText/>! Then you will
forever be part of the family.

:::

To do this first install the git secret package which includes the relevant
dependencies using homebrew:

```
brew install git-secret
```

Next create a RSA key-pair for your email address:

```
gpg --full-generate-key
```

There will be a sequence of questions you answer. In the prompts just choose the
default options. You also will want to set the expiration of the key to 0 (never
expire). Use your preferred email address e.g., the one linked to GitHub. Make
sure to write down or remember the passphrase you use. Send the main Smile
coordinator for your lab your public key by sending the output of this command
to them on slack or via email (replace example@gmail.com with the address you
provided to `gpg`):

<div class="language-"><pre><code><span class="line">gpg --armor --export example@gmail.com</span></code></pre></div>

Wait for the coordinator to reply and to make a push to the main Smile repo
giving access to the encrypted files to your email address.

## 4. Install a web browser (or two or three)

Install Safari, Chrome, ARC and/or Firefox. It can make sense to install
multiple browsers and test your code against each of them. However, for
developing/testing your cod ARC/Chrome is particularly recommended because of
the wide range of available extensions.

## 5. Install VSCode, Vue Extension for VSCode, and Prettier

It is highly recommended that you use [VS Code](https://code.visualstudio.com/),
the [Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
extension, and the
[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
extension. These tools will help you write and debug your code more easily.
