#

# <p align="center"> THE DEFINITIVE GUIDE </p>

# <p align="center"><img src="https://raw.githubusercontent.com/bluntwizard/steam_deck_dub_edition/f9e102fc2dec0f986433a9f33ff7bbbb05cb9d6d/Steam_Deck_colored_logo.svg" alt="alt text" width="25%" height="25%"><img src="https://github.com/bluntwizard/steam_deck_dub_edition/blob/main/dub_edition.png?raw=true" alt="alt text" width="20%" height="20%"> EDITION </p>

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

### DECKY LOADER PLUGINS

------

| PLUGIN | DISCRIPTION |
| ------ | ------ |
| **`CSSLOADER`** | LOADS CSS (THEMES) DYNAMICALLY INTO THE STEAM DECK GAME UI |
| **`SYSTEM TOOLBOX`** | HELPFUL TOOLS TO CONTROL VARIOUS SETTINGS OF THE STEAM DECK |
| **`DECKFAQS`** | A GAMEFAQS BROWSER FOR THE STEAM DECK (BOTH STEAM AND NON-STEAM GAMES) |
| **`VIBRANTDECK`** | ADJUST COLOR SETTINGS OF YOUR DECK |
| **`FANTASTIC`** | FAN CONTROLS |
| **`MUSICCONTROL`** | CONTROL RUNNING MEDIA PLAYERS USING THE DBUS INTERFACE (MPRIS). MEDIA PLAYER HAS TO BE STARTED THROUGH GAME MODE. |
| **`PAUSE GAMES`** | PAUSE/ RESUME GAMES TO REDIRECT RESOURCES AND EVEN PLAY/ STOP APPS THAT DON'T NATIVELY HABE AN IMMEDIATE OPTION TO DO SO. |
| **`PROTONDB BADGES`** | DISPLAY TAPPABLE PROTONDB BADGES ON YOUR GAME PAGES |
| **`FRIENDSFIX`** | FIXES THE MISSING FRIENDS UI BUG. |
| **`AUDIO LOADER`** | REPLACES STEAM UI SOUND EFFECTS WITH CUSTOM SOUNDS AND ADDS MUSIC TO MENUS. |
| **`BLUETOOTH`** | QUICKLY CONNECT TO YOUR ALREADY PAIRED BLUETOOTH DEVICES. |
| **`NOTEBOOK`** | QUICKLY SCRIBBLE DOWN IMPORTANT CODES OR NOTES DURING YOUR PLAY SESSIONS. |
| **`POWERTOOLS`** | POWER TWEAKS FOR POWER USERS |
| **`MEMORY DECK`** | A SIMPLISTIC SCANMEM WRAPPER FOR DECKY. ENABLING SCANNING FOR AND EDITING VALUES IN MEMORY. |
| **`ANIMATION CHANGER`** | A BOOT/ SUSPEND ANIMATION MANAGEMENT PLUGIN. |
| **`BASH SHORTCUTS`** | MANAGER FOR SHORTCUTS IN THE QUICK ACCESS MENU! USES BASH UNDER THE HOOD. |
| **`HTLB FOR DECK`** | A PLUGIN TO SHOW YOU GAME LENGTHS ACCORDING TO HOW LONG TO BEAT |
| **`AUTOSUSPEND`** | AUTOMATICALLY SUSPEND ON LOW POWER. |
| **`EMUCHIEVEMENTS`** | PLUGIN FOR VIEWING RETROACHIEVEMENTS PROGRESS. PART OF THE EMUDECK PROJECT |
| **`TUNNELDECK`** | ENABLES VPN SUPPORT WITHIN GAMING MODE AND ACTIVATES OPENVPN SUPPORT FOR NETWORK MANAGER. |
| **`AUTOFLATPAKS`** | A PLUGIN TO MANAGE, NOTIFY, AND AUTOMATICALLY UPDATE FLATPAKS ON YOUR STEAMDECK CONSOLE |
| **`METADECK`** | PLUGIN FOR VIEWING METADATA FOR NON STEAM GAMES FROM IGDB. PART OF THE EMUDECK PROJECT |
| **`MOONDECK`** | MOONDECK IS AN AUTOMATION TOOL THAT WILL SIMPLIFY LAUNCHING YOUR STEAM GAMES VIA THE MOONLIGHT CLIENT FOR STEAMING. |
| **`STEAMGRIDDB`** | CUSTOM LIVRARY ART FOR STEAM APPS AND NON-STEAM SHORTCUTS FROM STEAMGRIDDB OR YOUR LOCAL FILES. |
| **`DISCORD STATUS`** | DISPLAYS CURRENT STEAM DECK GAME IN DISCORD |
| **`VOLUME MIXER`** | CONTROL THE COLUME OF APPLICATIONS AND CONNECTED BLUETOOTH SOURCES. |
| **`FREE GAMES`** | A PLUGIN TO NOTIFY YOU OF FREE GAMES AVAILABLE ON THE EPIC GAMES STORE. |
| **`CONTROLLER TOOLS`** | THE MISSING GAME CONTROLLER MENU. DISPLAYS THE CURRENT BATTERY % AND CHARGING STATUS. SUPPORTS: DUALSENSE, DUALSHOCK 4, NINTENDO SWITCH PRO CONTROLLER |
| **`TAILSCALE CONTROL`** | A DECKY PLUGIN TO ACTIVATE AND DEACTIVATE TAILSCALE, WHILE STAYING IN GAMING MODE. [NOTE: TAILSCALE NEEDS TO BE INSTALLED, THIS WORKS ONLY LIKE A SWITCH FOR THE SAME. |
| **`DECKMTP`** | A PLUGIN THAT ALLOWS YOUR STEAM DECK TO TRANSFER FILES TO YOUR PC VIA MTP AND USB |
| **`DECKY RECORDER`** | RECORD YOUR GAMES WITH DECKY RECORDER |
| **`STEAMBACK`** | AUTOMATIC SAVE GAME SNAPSHOT/ RESTORE FOR STEAM |
| **`DECKROULETTE`** | A PLUGIN THAT ALLOWS YOU TO NAVIGATE TO A RANDOM GAME IN YOUR LIVRARY OR A STEAM COLLECTION. |
| **`QUICK LAUNCH`** | QUICKLY LAUNCH NON-STEAM-APPS FROM THE QUICK ACCESS MENU WITHOUT ADDING THEM AS SHORTCUTS, OR ADD THEM TO THE STEAM LIBRARY. |
| **`DECKY CLOUD SAVE`** | MANAGE CLOUD SAVES FOR GAMES THAT DO NOT SUPPORT IT IN [CURRENT YEAR] |
| **`STORAGE CLEANER`** | QUICKLY VISUALIZE, SELECT AND CLEAR SHADER CACHE AND COMPATIBILITY DATA. |
| **`NETWORK INFO`** | VIEW DETAILED INFORMATION ABOUT YOUR STEAM DECK'S NETWORK INTERFACES. |
| **`GAME THEME MUSIC`** | PLAY THEME SONGS ON YOUR GAME PAGES |
| **`SHOTTY`** | A PLUGIN FOR COPYING OVER SCREENSHOTS TO THE PICTURES FOLDER |
| **`BOOKMARKS`** | REMEMBER HARD-TO-REACH PAGES IN STEAM'S UI, AND OPEN WEB PAGES. |
| **`MANGOPEEL`** | A DECKY PLUGIN FOR CUSTOM PERFORMANCE MONITORING STYLE. |
| **`GAMEVIEW MUSIC`** | ADDS BACKGROUND MUSIC TO THE GAME PAGE |
| **`VOLUME BOOST`** | A DECKY PLUGIN TO BOOST VOLUME. |
| **`WEB BROWSER`** | A WEB BRPWSER WITH MULTIPLE FEATURES INCLUDING TABS!, LIMITED GAMEPAD SUPPORT, FAVORITES AND A MULTIFUNCTION SEARCH/ URL BAR. |
| **`DECKYFILESERVER`** | START YOUR OWN FILE SERVER FROM YOUR STEAM DECK TO EASILY TRANSFER FILES FROM YOUR STEAM DECK. |
| **`TABMASTER`** | GIVES YOU FULL CONTROL OVER YOUR STEAM LIBRARY! SUPPORT FOR CUSTOMIZING, ADDING, AND HIDING LIBRARY TABS. |

#

### DECKY LOADER PLUGINS [PRE-RELEASE/ TESTING]

------

| PLUGIN | DISCRIPTION |
| ------ | ------ |
| **`MICROSDECK`** | A PLUGIN TO MANAGE MICROSD CARDS. |
| **`FREE LOADER`** | PLUGIN TO PROVIDE NOTIFICATIONS FOR AND EASY ACCESS TO FREE GAMES ON THE STEAM STORE. |
| **`RADIYO!`** | SEARCH AND PLAY MUSIC FROM INTERNET RADIO STATIONS WHILE GAMING |
| **`DECKSETTINGS`** | PLUGIN TO BROWSE RECOMMENDED STEAM DECK GAME SETTINGS FROM SHAREDECK AND STEAMDECKHQ. |
| **`TS3 QUICKACCESS`** | A TEAMSPEAK 3 CLIENT PLUGIN THAT INTEGRATES TEAMSPEAK 3 INTO STEAM DECK'S QUICK ACCESS MENU. |

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

------
