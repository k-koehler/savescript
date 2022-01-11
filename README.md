# savescript

## Description

Simple command line utility which facilitates automating zsh/bash/sh scripts

### Typical Usage

Via last command:

```bash
➜  ~ echo "foo"
foo
➜  ~ savescript foo
➜  ~ foo
foo
```

Via pipe:

```bash
➜  ~ echo "bar" | savescript bar
➜  ~ bar
bar
```

### First Time Usage

```bash
➜  ~ sudo npm i -g savescript
...
➜  ~ echo "my first script"
my first script
➜  ~ savescript first-script
 First time running savescript detected. Please type "source /home/kev/.zshrc" or reload your shell.
➜  ~ source /home/kev/.zshrc
➜  ~ first-script
my first script
```
