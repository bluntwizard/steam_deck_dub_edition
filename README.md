<div style="width: 100%;">
    <img src="src/assets/images/sdde.svg" style="width: 100%;">
</div>


#

# <p align="center"> THE DEFINITIVE GUIDE </p>

# <p align="center"><img src="src/assets/images/Steam_Deck_colored_logo.svg" alt="alt text" width="25%" height="25%"><img src="src/assets/images/dub_edition.png" alt="alt text" width="20%" height="20%"> EDITION </p>

> ### <p align="center">"THROW SOME D'S ON THAT BITCH."</p>

------

>##### **THIS GUIDE IS INTENDED AS A DEFINITIVE START GUIDE REGARDING VARIOUS AVENUES OF INTEREST ON THE STEAM DECK.**
> 
>##### **FROM INSTALLING PACKAGES AND RETAINING THEM BETWEEN UPDATES, TO EMULATION AND SOFTWARE MODIFICATIONS/ PLUGINS.**
> 
> ### <p align="center">*`⚠︎⚠︎⚠︎ ROUGHLY INTENDED AS A STEP-BY-STEP GUIDE. ⚠︎⚠︎⚠︎`*</p>
>
> ### <p align="center">**`IF YOU FEEL THERE IS SOMETHING MISSING, PLEASE MAKE A COMMIT.`**</p>

------

| TABLE OF CONTENTS |
| ------ |
|[**SECTION I** : GETTING STARTED](https://github.com/bluntwizard/steam_deck_dub_edition#section-i-getting-started)|
|[**SECTION II** : OPTIMIZATIONS](https://github.com/bluntwizard/steam_deck_dub_edition#section-ii-optimizations)|
|[**SECTION III** : GAMING](https://github.com/bluntwizard/steam_deck_dub_edition#section-iii-gaming)|
|[**SECTION IV** : DECKY LOADER]()|
||
||
||
||
|[X: GLOSSARY]()|
|[X: RECOMMENDED FLATPAK LIST]()|
|[X: DEKCY LOADER PLUGIN LIST](#decky-loader-plugins)|

------

------

## SECTION I: GETTING STARTED

**`SUDO, RETAINING PACKAGES BETWEEN UPDATES, TRUST ISSUES, PACMAN & YAY`**

------

### 1. SETTING ADMIN/ [SUDO](https://wiki.archlinux.org/title/sudo) PASSWORD WITHIN KONSOLE/ [TERMINAL EMULATOR](https://en.wikipedia.org/wiki/Terminal_emulator)

#

###### COPY/ PASTE

```
passwd
```

> #### **ENTER NEW ADMIN PASSWORD**


#

### 2. INSTALLING [RWFUS: READ-WRITE OVERLAY FILESYSTEM](https://github.com/ValShaped/rwfus)

#

> **STEAMOS IS AN [IMMUTABLE OPERATING SYSTEM](https://kairos.io/blog/2023/03/22/understanding-immutable-linux-os-benefits-architecture-and-challenges/#what-is-an-immutable-linux-os), RWFUS COVERS THE /usr/ DIRECTORY [AND SOME OTHERS] ALLOWING PACMAN TO BE INITIALIZED WITHOUT LOSING PACKAGES WHEN THE NEXT UPDATE COMES OUT.**

###### COPY/ PASTE

```
git clone https://github.com/ValShaped/rwfus.git && cd rwfus && ./rwfus -iI && sudo reboot
```

#

### 3. INSTALLING [DEPENDENCIES](https://askubuntu.com/questions/361741/what-are-dependencies#:~:text=Sometimes%20when%20you%20install%20programs%2C%20they%20rely%20on%20other%20programs%20to%20work.%20These%20other%20programs%20are%20called%20dependencies.)

#

>**DOWNLOAD, POPULATE, & REFRESH KEYS FROM UBUNTU'S KEYSERVER.**
> 
>**[GCC/ CLANG/ GLIBC/ MAKE - MAY BE REDUNDANT.]**

###### COPY/ PASTE

```
sudo echo "keyserver hkps://keyserver.ubuntu.com" >> /etc/pacman.d/gnupg/gpg.conf && sudo pacman-key --init && sudo pacman-key --populate && sudo pacman-key --refresh-keys && sudo pacman -S base-devel && sudo pacman -S gcc && sudo pacman -S clang && sudo pacman -S make && sudo pacman -S glibc
```

#

### 4. FIXING TRUST ISSUES

#

> ### **THE MAIN ISSUE:**
>
> #### **[PGP KEY VERIFICATION](https://www.secureideas.com/blog/how-to-verify-pgp-signatures#:~:text=Verifying%20PGP%20signatures%20allows%20us,need%20the%20signer's%20public%20key.) IS BROKEN, FAILING DURING PACKAGE INSTALLATION.**
>
> #### **THIS IS BECAUSE THE CORE ARCHLINUX-KEYRING IS OUT OF DATE. PACMAN/GNUPG WILL SHOW THAT ANY PACKAGE YOU ARE TRYING TO INSTALL IS OUT OF DATE, CORRUPT, OR OF MARGINAL TRUST.**
>
> #### **CHANGING REPOS TO OFFICIAL ARCH WOULD FIX THIS, BUT THAT WOULD CHANGE THE KERNEL & OTHER CORE PACKAGES.**
>
> #### **WE COULD TURN OFF PGP VERIFICATION, BUT THIS IS INSECURE.**
>
> #### **SO WE MUST MANUALLY INSTALL IT.**

###### COPY/PASTE

```
sudo cd Download https://archlinux.org/packages/core/any/archlinux-keyring/download && sudo pacman -U archlinux-keyring-20220713-2-any.pkg.tar.zst
```

#

> ### [PACMAN](https://wiki.archlinux.org/title/Pacman) IS NOW READY.
>
> #### USER CAN NOW BUILD AND INSTALL PACKAGES FROM [THE AUR](https://wiki.archlinux.org/title/Arch_User_Repository#:~:text=The%20Arch%20User%20Repository%20(AUR)%20is%20a%20community%2Ddriven%20repository%20for%20Arch%20users.).
>
> #### IN CONJUNCTION WITH RWFUS THESE PACKAGES WILL NOT BE WIPED ON NEXT UPDATE.

#

### 5. INSTALLING [YAY](https://github.com/Jguer/yay#yay) [OPTIONAL]

#

> **YAY : Yet Another Yogurt - An [AUR Helper](https://wiki.archlinux.org/title/AUR_helpers#:~:text=AUR%20helpers%20automate%20usage%20of%20the%20Arch%20User%20Repository.) Written in Go.**

###### COPY/ PASTE

```
git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si
```

------

------

## SECTION II: OPTIMIZATIONS

**`CONVERT FILE SYSTEM & MODIFY SWAP TO OPTIMIZE READ/ WRITE & ADD STORAGE`**

------

### 1. INSTALLING [STEAMOS-BRTFS](https://gitlab.com/popsulfr/steamos-btrfs)

#

> #### **CONVERTS FILESYSTEM FROM [EXT4](https://en.wikipedia.org/wiki/Ext4) TO [BTRFS](https://en.wikipedia.org/wiki/Btrfs).**
> 
> #### **CAN INCREASE STORAGE UP TO 33%.**
> 
> #### **[PERSONAL EXPERIENCE - MILEAGE MY VARY WITH FILE TYPE AND SIZE.]**

### -REQUIREMENTS

#

> #### **AT LEAST 20% FREE SPACE.**
> 
> #### **CHOSE ALL AVAILABLE OPTIONS.**
> 
> #### **REBOOT WHEN PROMPTED.**
> 
> #### **PROCESS CAN TAKE UP TO 30 MINUTES.**

###### COPY/ PASTE

```
t="$(mktemp -d)" && curl -sSL https://gitlab.com/popsulfr/steamos-btrfs/-/archive/main/steamos-btrfs-main.tar.gz | tar -xzf - -C "$t" --strip-components=1 && "$t/install.sh" && rm -rf "$t"
```

#

### 2. INSTALLING [CRYOUTILITIES](https://github.com/CryoByte33/steam-deck-utilities#cryoutilities)

#

> #### **CYROUTILITIES IS A COLLECTION OF SCRIPTS & UTILITIES TO IMPROVE PERFORMANCE & MANAGE STORAGE ON THE STEAM DECK.**

###### COPY/ PASTE

```
cd Desktop && echo "#!/usr/bin/env xdg-open
[Desktop Entry]
Name=Install CryoUtilities
Exec=curl https://raw.githubusercontent.com/CryoByte33/steam-deck-utilities/main/install.sh | bash -s --
Icon=steamdeck-gaming-return
Terminal=true
Type=Application
StartupNotify=false" >> InstallCryoUtilities.desktop && sudo gtk-launch EmuDeck.desktop
```

```
CHOSE RECOMMENDED SETTINGS
```

------

------

## SECTION III: GAMING

> **`EMULATION, NON-STEAM GAMES, NON-STEAM LAUNCHERS, WINDOWS SOFTWARE, CONSOLE STREAMING & FLASHPOINT`**

------

### 1. INSTALLING EMUDECK

#

> #### **INSTALLS EMULATORS FROM THE DISCOVER STORE & OFFICIAL REPOSITORIES.**
> 
> #### **CREATES ~/Emulation DIRECTORY WITH FOLDERS FOR BIOS ROMS.**
> 
> #### **PROVIDES GENERIC STEAM INPUT PROFILES FOR EMULATORS.**
> 
> #### **PRE-OPTIMIZES EMULATORS, ALLOWS THE USER TO CHANGE THESE SETTINGS.**

#

> ### **INCLUDES `STEAM ROM MANAGER`.**
> 
> #### **`STEAM ROM MANAGER` EASILY ADDS YOUR NON-STEAM GAMES TO YOUR STEAM LIBRARY.**
> 
> #### **`STEAM ROM MANAGER` AUTOMATICALLY CREATES COLLECTIONS FOR EACH CONSOLE IN YOUR LIBRARY.**
> 
> #### **`STEAM ROM MANAGER` AUTOMATICALLY FETCHES ARTWORK FOR GAMES.**

###### COPY/ PASTE

```
sudo cd Desktop && sudo wget -q https://www.emudeck.com/EmuDeck.desktop -O ~/Desktop/EmuDeck.desktop && sudo gtk-launch EmuDeck.desktop
```

### **SETUP**

> #### **CHOOSE MANUAL SETUP.**
> 
> #### **SELECT ALL EMULATORS LISTED.**
> 
> #### **CHANGE ANY OTHER WANTED SETTINGS.**

#

### 2. REPLACING YUZU - THE NINTENTO SWITCH EMULATOR, WITH YUZU EARLY ACCESS, ENABLING AUTO UPDATE

#

###### COPY/ PASTE

```
curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i - &&  awk -v prepend="<curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i ->" 'NR==2{print prepend $0;next};1' $HOME/Emulation/tools/launchers/yuzu.sh
```

#

###### ABOVE CODE POSSIBLY REPLACES THESE

```
Download Yuzu ea
copy/ paste

    curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i -
```

```
edit yuzu.sh
copy paste beneath bin/bash

    curl -s https://api.github.com/repos/pineappleEA/pineapple-src/releases/latest | jq -r ".assets[0] | .browser_download_url" | wget -qO $HOME/Applications/yuzu.AppImage -i -
```

#

### 3. ISNTALLING XENIA

#

> #### **THE MICROSOFT XBOX 360 EMULATOR.**

```
START 'EMUDECK'
SELECT 'MANAGE EMULATORS'
SELECT & INSTALL 'XENIA'
```

#

### 3-a. REPLACING XENIA

#

> #### **CURRENT XENIA BUILDS CRASH ON STEAM DECK WHEN LOADING XBLA TITLES.**

###### COPY/ PASTE

 ```
 sudo wget -q https://github.com/xenia-canary/xenia-canary/releases/tag/190cef9 -O ~/emulation/roms/xbox360/xenia_canary.exe 
```

#

### 3-b. UNLOCK FULL XBLA GAME ACCESS

#

> **BY DEFAULT XENIA REPORTS NO LICENSE FOR XBLA TITLES.**
>
> **NO LICENSE WILL CAUSE XBLA TITLES TO START IN DEMO MODE/ NOT AT ALL.***

###### COPY/ PASTE

```
awk '{gsub(/license_mask = 0/, "license_mask = 1"); print}' xenia-canary.config.toml > xenia-canary.config.toml
```

#

###### ABOVE CODE POSSIBLY REPLACES THIS

```
    edit xenia-canary.config.toml inside ~/Emulation/roms/xbox360
        
    change

        [Content]
        license_mask = 0

    to

        [Content]
        license_mask = 1
```

------

------

## SECTION IV: DECKY LOADER

------

### 1. INSTALLING DECKY LOADER

#

> #### **HOMEBREW PLUGIN LAUNCHER FOR THE STEAM DECK.**
>
> #### **CAN BE USED TO STYLIZE MENUS, CHANGE SYSTEM SOUNDS, ADJUST SCREEN SATURATION, CHANGE ADDITIONAL SYSTEM SETTINGS, AND MUCH MORE.**

###### COPY/ PASTE

```
sudo cd Desktop && sudo wget -q https://github.com/SteamDeckHomebrew/decky-installer/releases/latest/download/decky_installer.desktop && sudo gtk-launch decky_installer.desktop
```

------

------

<details>
  <summary align="center"><h1>DECKY LOADER PLUGINS&nbsp;<img src="https://decky.xyz/static/icon-45ca1f5aea376a9ad37e92db906f283e.png" style="vertical-align:middle" height="30"></h1></summary>

<p align="center">
  <a href="https://github.com/SteamDeckHomebrew/decky-loader/releases"><img src="https://img.shields.io/github/downloads/SteamDeckHomebrew/decky-loader/total" /></a>
  <a href="https://github.com/SteamDeckHomebrew/decky-loader/stargazers"><img src="https://img.shields.io/github/stars/SteamDeckHomebrew/decky-loader" /></a>
  <a href="https://github.com/SteamDeckHomebrew/decky-loader/commits/main"><img src="https://img.shields.io/github/last-commit/SteamDeckHomebrew/decky-loader.svg" /></a>
  <a href="https://weblate.werwolv.net/engage/decky/"><img src="https://weblate.werwolv.net/widgets/decky/-/decky/svg-badge.svg" alt="Translation status" /></a>
  <a href="https://github.com/SteamDeckHomebrew/decky-loader/blob/main/LICENSE"><img src="https://img.shields.io/github/license/SteamDeckHomebrew/decky-loader" /></a>
  <a href="https://deckbrew.xyz/discord"><img src="https://img.shields.io/discord/960281551428522045?color=%235865F2&label=discord" /></a>
  <br>
  <br>
  <img src="https://media.discordapp.net/attachments/966017112244125756/1012466063893610506/main.jpg" alt="Decky screenshot" width="80%">
</p>

<details>
    <summary alig="center"><h3>PRIMARY REPOSITORY</h3></summary>
    <br><hr>
    <b><a href="">ANIMATION CHANGER</a></b> - A BOOT/ SUSPEND ANIMATION MANAGEMENT PLUGIN.
    <br><hr>
    <b><a href="">AUDIO LOADER</a></b> - REPLACES STEAM UI SOUND EFFECTS WITH CUSTOM SOUNDS AND ADDS MUSIC TO MENUS.
    <br><hr>
    <b><a href="">AUTOFLATPAKS</a></b> - A PLUGIN TO MANAGE, NOTIFY, AND AUTOMATICALLY UPDATE FLATPAKS ON YOUR STEAMDECK CONSOLE
    <br><hr>
    <b><a href="">AUTOSUSPEND</a></b> - AUTOMATICALLY SUSPEND ON LOW POWER.
    <br><hr>
    <b><a href="">BASH SHORTCUTS</a></b> - MANAGER FOR SHORTCUTS IN THE QUICK ACCESS MENU! USES BASH UNDER THE HOOD.
    <br><hr>
    <b><a href="">BLUETOOTH</a></b> - QUICKLY CONNECT TO YOUR ALREADY PAIRED BLUETOOTH DEVICES.
    <br><hr>
    <b><a href="">BOOKMARKS</a></b> - REMEMBER HARD-TO-REACH PAGES IN STEAM'S UI, AND OPEN WEB PAGES.
    <br><hr>
    <b><a href="">CONTROLLER TOOLS</a></b> - THE MISSING GAME CONTROLLER MENU. DISPLAYS THE CURRENT BATTERY % AND CHARGING STATUS. SUPPORTS: DUALSENSE, DUALSHOCK 4, NINTENDO SWITCH PRO CONTROLLER
    <br><hr>
    <b><a href="">CSSLOADER</a></b> - LOADS CSS (THEMES) DYNAMICALLY INTO THE STEAM DECK GAME UI
    AUDIO LOADER REPLACES STEAM UI SOUND EFFECTS WITH CUSTOM SOUNDS AND ADDS MUSIC TO MENUS.
    <br><hr>
    <b><a href="">DECKFAQS</a></b> - A GAMEFAQS BROWSER FOR THE STEAM DECK (BOTH STEAM AND NON-STEAM GAMES)
    <br><hr>
    <b><a href="">DECKYFILESERVER</a></b> - START YOUR OWN FILE SERVER FROM YOUR STEAM DECK TO EASILY TRANSFER FILES FROM YOUR STEAM DECK.
    <br><hr>
    <b><a href="">DECKMTP</a></b> - A PLUGIN THAT ALLOWS YOUR STEAM DECK TO TRANSFER FILES TO YOUR PC VIA MTP AND USB
    <br><hr>
    <b><a href="">DECKROULETTE</a></b> - A PLUGIN THAT ALLOWS YOU TO NAVIGATE TO A RANDOM GAME IN YOUR LIVRARY OR A STEAM COLLECTION.
    <br><hr>
    <b><a href="">DECKY CLOUD SAVE</a></b> - MANAGE CLOUD SAVES FOR GAMES THAT DO NOT SUPPORT IT IN [CURRENT YEAR]
    <br><hr>
    <b><a href="">DECKY RECORDER</a></b> - RECORD YOUR GAMES WITH DECKY RECORDER
    <br><hr>
    <b><a href="">DISCORD STATUS</a></b> - DISPLAYS CURRENT STEAM DECK GAME IN DISCORD
    <br><hr>
    <b><a href="">EMUCHIEVEMENTS</a></b> - PLUGIN FOR VIEWING RETROACHIEVEMENTS PROGRESS. PART OF THE EMUDECK PROJECT
    <br><hr>
    <b><a href="">FANTASTIC</a></b> - FAN CONTROLS
    <br><hr>
    <b><a href="">FREE GAMES</a></b> - A PLUGIN TO NOTIFY YOU OF FREE GAMES AVAILABLE ON THE EPIC GAMES STORE.
    <br><hr>
    <b><a href="">FRIENDSFIX</a></b> - FIXES THE MISSING FRIENDS UI BUG.
    <br><hr>
    <b><a href="">GAMEVIEW MUSIC</a></b> - ADDS BACKGROUND MUSIC TO THE GAME PAGE
    <br><hr>
    <b><a href="">GAME THEME MUSIC</a></b> - PLAY THEME SONGS ON YOUR GAME PAGES
    <br><hr>
    <b><a href="">HTLB FOR DECK</a></b> - A PLUGIN TO SHOW YOU GAME LENGTHS ACCORDING TO HOW LONG TO BEAT
    <br><hr>
    <b><a href="">MANGOPEEL</a></b> - A DECKY PLUGIN FOR CUSTOM PERFORMANCE MONITORING STYLE.
    <br><hr>
    <b><a href="">MEMORY DECK</a></b> - A SIMPLISTIC SCANMEM WRAPPER FOR DECKY. ENABLING SCANNING FOR AND EDITING VALUES IN MEMORY.
    <br><hr>
    <b><a href="">METADECK</a></b> - PLUGIN FOR VIEWING METADATA FOR NON STEAM GAMES FROM IGDB. PART OF THE EMUDECK PROJECT
    <br><hr>
    <b><a href="">MOONDECK</a></b> - MOONDECK IS AN AUTOMATION TOOL THAT WILL SIMPLIFY LAUNCHING YOUR STEAM GAMES VIA THE MOONLIGHT CLIENT FOR STEAMING.
    <br><hr>
    <b><a href="">MUSICCONTROL</a></b> - CONTROL RUNNING MEDIA PLAYERS USING THE DBUS INTERFACE (MPRIS). MEDIA PLAYER HAS TO BE STARTED THROUGH GAME MODE.
    <br><hr>
    <b><a href="">NETWORK INFO</a></b> - VIEW DETAILED INFORMATION ABOUT YOUR STEAM DECK'S NETWORK INTERFACES.
    <br><hr>
    <b><a href="">NOTEBOOK</a></b> - QUICKLY SCRIBBLE DOWN IMPORTANT CODES OR NOTES DURING YOUR PLAY SESSIONS.
    <br><hr>
    <b><a href="">PAUSE GAMES</a></b> - PAUSE/ RESUME GAMES TO REDIRECT RESOURCES AND EVEN PLAY/ STOP APPS THAT DON'T NATIVELY HABE AN IMMEDIATE OPTION TO DO SO.
    <br><hr>
    <b><a href="">POWERTOOLS</a></b> - POWER TWEAKS FOR POWER USERS
    <br><hr>
    <b><a href="">PROTONDB BADGES</a></b> - DISPLAY TAPPABLE PROTONDB BADGES ON YOUR GAME PAGES
    <br><hr>
    <b><a href="">QUICK LAUNCH</a></b> - QUICKLY LAUNCH NON-STEAM-APPS FROM THE QUICK ACCESS MENU WITHOUT ADDING THEM AS SHORTCUTS, OR ADD THEM TO THE STEAM LIBRARY.
    <br><hr>
    <b><a href="">SHOTTY</a></b> - A PLUGIN FOR COPYING OVER SCREENSHOTS TO THE PICTURES FOLDER
    <br><hr>
    <b><a href="">STEAMBACK</a></b> - AUTOMATIC SAVE GAME SNAPSHOT/ RESTORE FOR STEAM
    <br><hr>
    <b><a href="">STEAMGRIDDB</a></b> - CUSTOM LIVRARY ART FOR STEAM APPS AND NON-STEAM SHORTCUTS FROM STEAMGRIDDB OR YOUR LOCAL FILES.
    <br><hr>
    <b><a href="">STORAGE CLEANER</a></b> - QUICKLY VISUALIZE, SELECT AND CLEAR SHADER CACHE AND COMPATIBILITY DATA.
    <br><hr>
    <b><a href="">SYSTEM TOOLBOX</a></b> - HELPFUL TOOLS TO CONTROL VARIOUS SETTINGS OF THE STEAM DECK
    <br><hr>
    <b><a href="">TABMASTER</a></b> - GIVES YOU FULL CONTROL OVER YOUR STEAM LIBRARY! SUPPORT FOR CUSTOMIZING, ADDING, AND HIDING LIBRARY TABS.
    <br><hr>
    <b><a href="">TAILSCALE CONTROL</a></b> - A DECKY PLUGIN TO ACTIVATE AND DEACTIVATE TAILSCALE, WHILE STAYING IN GAMING MODE. [NOTE: TAILSCALE NEEDS TO BE INSTALLED, THIS WORKS ONLY LIKE A SWITCH FOR THE SAME.
    <br><hr>
    <b><a href="">TUNNELDECK</a></b> - ENABLES VPN SUPPORT WITHIN GAMING MODE AND ACTIVATES OPENVPN SUPPORT FOR NETWORK MANAGER.
    <br><hr>
    <b><a href="">VIBRANTDECK</a></b> - ADJUST COLOR SETTINGS OF YOUR DECK
    <br><hr>
    <b><a href="">VOLUME BOOST</a></b> - A DECKY PLUGIN TO BOOST VOLUME.
    <br><hr>
    <b><a href="">VOLUME MIXER</a></b> - CONTROL THE COLUME OF APPLICATIONS AND CONNECTED BLUETOOTH SOURCES.
    <br><hr>
    <b><a href="">WEB BROWSER</a></b> - A WEB BRPWSER WITH MULTIPLE FEATURES INCLUDING TABS!, LIMITED GAMEPAD SUPPORT, FAVORITES AND A MULTIFUNCTION SEARCH/ URL BAR.
    <br><hr>
    
</details>

<details>
<br><hr>
<summary alig="center"><h3>PRE-RELEASE/ TESTING</h3></summary>
<br><hr>
<b><a href="">DECKSETTINGS</a></b> - PLUGIN TO BROWSE RECOMMENDED STEAM DECK GAME SETTINGS FROM SHAREDECK AND STEAMDECKHQ.
<br><hr>
<b><a href="">FREE LOADER</a></b> - PLUGIN TO PROVIDE NOTIFICATIONS FOR AND EASY ACCESS TO FREE GAMES ON THE STEAM STORE.
<br><hr>
<b><a href="">MICROSDECK</a></b> - A PLUGIN TO MANAGE MICROSD CARDS.
<br><hr>
<b><a href="">TS3 QUICKACCESS</a></b> - A TEAMSPEAK 3 CLIENT PLUGIN THAT INTEGRATES TEAMSPEAK 3 INTO STEAM DECK'S QUICK ACCESS MENU.
<br><hr>

</details>

------

#

### ■ DISCOVER STORE FLATPAKS

```
CHROME//FIREFOX
DISCORD
PEAZIP
JDOWNLOADER
HEROIC LAUNCHER
```

------

## Building for Different Platforms

Steam Deck DUB Edition can be built for Windows, macOS, and Linux platforms:

### Prerequisites

- Node.js 16+ and npm
- For icon generation: ImageMagick (`sudo apt install imagemagick` on Linux, `brew install imagemagick` on macOS)
- For macOS builds: A macOS machine is recommended for proper .icns file creation

### Build Commands

Build for all platforms:
```
npm run build
```

Build for specific platforms:
```
npm run build:win    # Windows (.exe, portable)
npm run build:mac    # macOS (.dmg)
npm run build:linux  # Linux (.AppImage, .deb)
```

The built applications will be located in the `dist` directory.

------
