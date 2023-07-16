# <p align="center"> THE DEFINITIVE GUIDE </p>
# <p align="center"><img src="https://raw.githubusercontent.com/bluntwizard/steam_deck_dub_edition/f9e102fc2dec0f986433a9f33ff7bbbb05cb9d6d/Steam_Deck_colored_logo.svg" alt="alt text" width="25%" height="25%"><img src="https://github.com/bluntwizard/steam_deck_dub_edition/blob/main/dub_edition.png?raw=true" alt="alt text" width="20%" height="20%"> EDITION </p>
###### <p align="center">"Throw some D's on that bitch"</p>
> **THIS GUIDE IS INTENDED AS A DEFINITIVE START GUIDE REGARDING VARIOUS AVENUES OF INTEREST ON THE STEAM DECK.**
> 
> **FROM BUILDING PACKAGES AND RETAINING THEM BETWEEN UPDATES, TO EMULATION AND SOFTWARE MODIFICATIONS/ PLUGINS.**
> 
> **IF YOU FEEL THERE IS SOMETHING MISSING, PLEASE MAKE A COMMIT.**

`THIS IS INTENDED AS A STEP BY STEP GUIDE`

### ■ DISCOVER STORE FLATPAKS
```sh
CHROME//FIREFOX
DISCORD
PEAZIP
JDOWNLOADER
HEROIC LAUNCHER
```

### ■ SET ADMIN PASSWORD WITHIN KONSOLE/ TERMINAL EMULATOR
###### COPY/PASTE
```sh
passwd
```
```sh
ENTER NEW ADMIN PASSWORD
```
### ■ WRITE ACCESS & INSTALLING BUILD DEPENDENCIES
> **DISABLES READONLY**
> 
>**DOWNLOAD, POPULATE, AND REFRESH KEYS FROM UBUNTU'S KEYSERVER**
> 
>**[GCC/ CLANG/ GLIBC/ MAKE - MAY BE REDUNDANT]**

###### COPY/ PASTE
```sh
sudo steamos-readonly disable && echo "keyserver hkps://keyserver.ubuntu.com" >> /etc/pacman.d/gnupg/gpg.conf && sudo pacman-key --init && sudo pacman-key --populate && sudo pacman-key --refresh-keys && sudo pacman -S base-devel && sudo pacman -S gcc && sudo pacman -S clang && sudo pacman -S make && sudo pacman -S glibc
```
### ■ FIXING TRUST ISSUES
> **THE MAIN ISSUE: PGP KEY VERIFICATION IS BROKEN, FAILING DURING PACKAGE INSTALLATION.**
>
> **THIS IS BECAUSE THE CORE ARCHLINUX-KEYRING IS OUT OF DATE. PACMAN/GNUPG WILL SHOW THAT ANY PACKAGE YOU ARE TRYING TO INSTALL IS OUT OF DATE, CORRUPT, OR OF MARGINAL TRUST.**
>
> **CHANGING REPOS TO OFFICIAL ARCH WOULD FIX THIS, BUT THAT WOULD CHANGE THE KERNEL AND OTHER CORE PACKAGES.**
>
> **WE COULD TURN OFF PGP VERIFICATION, BUT THIS IS INSECURE.**
>
> **SO WE MUST MANUALLY INSTALL IT.**

###### COPY/PASTE
```sh
sudo cd Download https://archlinux.org/packages/core/any/archlinux-keyring/download && sudo pacman -U archlinux-keyring-20220713-2-any.pkg.tar.zst
```
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
# STEAMOS-BRTFS
### ■ INSTALL & RUN
> **CONVERTS FILESYSTEM FROM EXT4 TO BTRFS**
> 
> **CAN INCREASE STORAGE UP TO 33%**
> 
> **[PERSONAL EXPERIENCE - MILEAGE MY VARY WITH FILE TYPE AND SIZE]**

##### -REQUIREMENTS
> **AT LEAST 20% FREE SPACE**
> 
> **CHOSE ALL AVAILABLE OPTIONS**
> 
> **REBOOT WHEN PROMPTED**
> 
> **PROCESS CAN TAKE UP TO 30 MINUTES**

###### COPY/ PASTE
```sh
t="$(mktemp -d)" && curl -sSL https://gitlab.com/popsulfr/steamos-btrfs/-/archive/main/steamos-btrfs-main.tar.gz | tar -xzf - -C "$t" --strip-components=1 && "$t/install.sh" && rm -rf "$t"
```
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
# CRYOUTILITIES
### ■ INSTALL & RUN
###### COPY/ PASTE
```sh
cd Desktop && echo "#!/usr/bin/env xdg-open
[Desktop Entry]
Name=Install CryoUtilities
Exec=curl https://raw.githubusercontent.com/CryoByte33/steam-deck-utilities/main/install.sh | bash -s --
Icon=steamdeck-gaming-return
Terminal=true
Type=Application
StartupNotify=false" >> InstallCryoUtilities.desktop && sudo gtk-launch EmuDeck.desktop
```
```sh
CHOSE RECOMMENDED SETTINGS
```
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
# INSTALLING EMULATORS USING EMUDECK
### ■ DOWNLOAD & INSTALL
###### COPY/ PASTE
```sh
sudo cd Desktop && sudo wget -q https://www.emudeck.com/EmuDeck.desktop -O ~/Desktop/EmuDeck.desktop && sudo gtk-launch EmuDeck.desktop
```
### ■ REPLACING YUZU WITH EARLY ACCESS BUILD & ENABLING AUTO UPDATE
###### COPY/ PASTE
```sh
curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i - &&  awk -v prepend="<curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i ->" 'NR==2{print prepend $0;next};1' $HOME/Emulation/tools/launchers/yuzu.sh
```
###### ABOVE CODE POSSIBLY REPLACES THESE
```sh
Download Yuzu ea
copy/ paste

    curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i -
```
```sh
edit yuzu.sh
copy paste beneath bin/bash

    curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i -
```
### ■ ADDING XENIA
```sh
START 'EMUDECK'
SELECT 'MANAGE EMULATORS'
SELECT & INSTALL 'XENIA'
```
### ■ REPLACING XENIA
> **CURRENT XENIA BUILDS CRASH ON STEAM DECK WHEN LOADING XBLA TITLES**

###### COPY/ PASTE
 ```sh
 sudo wget -q https://github.com/xenia-canary/xenia-canary/releases/tag/190cef9 -O ~/emulation/roms/xbox360/xenia_canary.exe 
```
### ■ UNLOCK FULL XBLA GAME ACCESS
###### COPY/ PASTE
```sh
awk '{gsub(/license_mask = 0/, "license_mask = 1"); print}' xenia-canary.config.toml > xenia-canary.config.toml
```
###### ABOVE CODE POSSIBLY REPLACES THIS
```sh
    edit xenia-canary.config.toml inside ~/Emulation/roms/xbox360
        
    change

        [Content]
        license_mask = 0

    to

        [Content]
        license_mask = 1
```
# DECKY LOADER
##### ■ INSTALLATION
###### COPY/ PASTE
```sh
sudo cd Desktop && sudo wget -q https://github.com/SteamDeckHomebrew/decky-installer/releases/latest/download/decky_installer.desktop && sudo gtk-launch decky_installer.desktop
```
# RWFUS
##### ■ INSTALLATION
###### COPY/ PASTE
```sh
git clone https://github.com/ValShaped/rwfus.git && cd rwfus && ./rwfus -iI
```
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
# <p align="center">`REBOOT-NOW`</p>
