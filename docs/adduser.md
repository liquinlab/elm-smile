#  Adding a new user to the organization

If your lab already has a base repo, you can skip all of the 
configuration steps yourself! Instead, here are a few steps for you
and the Smile coordinator of your lab to take in order to add your profile
to the organization. 

## On the user end
### 1. Github access

Tell the main Smile coordinator for your lab your username so they can
add you as a member of the lab's Github organization.

### 2. Request access to the shared configuration files

Your lab's base repository for smile will contain encrypted configuration files
which set up everything you need to run an experiment. To make use of these
pre-configured files, you will need to gain the appropriate permissions.  

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
expire) when prompted. Use your preferred email address e.g., the one linked to 
GitHub. Make sure to write down or remember the passphrase you use. Send the main Smile
coordinator for your lab your public key by sending the output of this command
to them on slack or via email (replace example@gmail.com with the address you
provided to `gpg`):

<div class="language-"><pre><code><span class="line">gpg --armor --export example@gmail.com</span></code></pre></div>

Wait for the coordinator to reply and to make a push to the main Smile repo
giving access to the encrypted files to your email address.


## On the coordinator end

From this point forward, lab members in your group should just clone from your
base repo and they will get the correct configuration files. Before being allowed
to decrypt those files, you will have to manually add their account to your base
repo. 

### 1. Import their GPG key

First, you will need the user's GPG key. They were instructed (above) to generate
this key, copy the public key, and send it to you via email or slack. You should 
copy this key manually, then type the following command:

```
pbpaste | gpg --import
```

### 2. Add this key to your keyring

Type the following command to reveal the identity of the new user:

```
git secret tell their@email.id
```

### 3. Re-encrypt the files
Add their identiy to the files: 

```
git secret reveal; git secret hide
```

### 4. Re-upload the files
Push the changes with the new user's information: 
```
npm run upload_config
```

## Testing access

For a new user to test if they have the correct permissions to the 
organization, they should proceed with [starting a new project](/starting).

## In case of errors
In the case where you have trouble adding a new user to the organization,
you might end up with a mess of gpg keys. Here are some useful commands
to listing your existing keys and removing them. If multiple errors occur,
the user should delete all existing keys and restart the instructions
on this page. 

```
gpg --list-keys
gpg --list-secret-keys
```
Then, you can delete a certain key by copying its revealed key_id into 
the command:
```
gpg --delete-key <key_id>
gpg --delete-secret-key <key_id>
```