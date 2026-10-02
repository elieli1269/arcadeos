# ArcadeOS

**Un Linux de salon.** Ubuntu 24.04 LTS, pas de bureau, pas de GNOME. Tu boots, tu tombes sur les jeux.

[![Build ArcadeOS ISO](https://github.com/elieli1269/arcadeos/actions/workflows/build-iso.yml/badge.svg)](https://github.com/elieli1269/arcadeos/actions/workflows/build-iso.yml)

ISO : [Releases](https://github.com/elieli1269/arcadeos/releases) (tag `nightly` mis à jour à chaque build).

## Ce que c’est

SteamOS, version Ubuntu, minuscule :

- Live ISO **BIOS + UEFI**
- **greetd** auto-login `gamer` / `gamer`
- **Sway** en kiosk — zéro barre, zéro icônes, zéro fenêtre décorée
- Launcher Big Picture (WebKitGTK) en plein écran
- Jeux intégrés (STACK, BREAK, ORBIT, NIBBLE) + natifs : Neverball, Pingus, LBreakout2
- **Arcade Store** : paquets Ubuntu (`apt-get install`) puis lancement auto
- Mesa + Vulkan, PipeWire, NetworkManager
- Super+Return → terminal `foot` si tu dois bidouiller

Pas un thème Ubuntu. Pas un live GNOME avec un fond d’écran. Un vrai squashfs Ubuntu noble, sans snap, sans desktop.

## Clé USB — le disque dur n’est pas touché

Le boot par défaut est un **live RAM**. ArcadeOS :

- n’installe rien sur le HDD / SSD interne
- n’active **pas** le swap (évite de casser une hibernation Windows)
- n’ouvre **pas** les disques LUKS (plus de demande de mot de passe BitLocker / crypto)
- ne reprend **pas** une session `resume=` depuis le swap interne
- ne monte **pas** l’EFI Windows
- écrit uniquement sur un overlay **tmpfs** (RAM) + la clé si tu l’utilises comme média live

Menu GRUB (6 s) :

1. **ArcadeOS — clé USB (disque dur intact)** — défaut
2. **graphismes sûrs** — NVIDIA récent / PC sans GPU (`nomodeset`, llvmpipe)
3. **copie en RAM** — après le chargement tu peux retirer la clé
4. **USB strict** — ignore tout ce qui n’est pas une clé USB

Si tu as eu une erreur au boot USB, prends **graphismes sûrs** (carte NVIDIA) ou **USB strict**.

Flasher avec **Ventoy**, **balenaEtcher**, ou `dd`. Évite Rufus en mode « ISO » (il réécrit le système de fichiers et casse le live).

## Arcade Store

Depuis le launcher : **Arcade Store**.

- Catalogue de jeux issus des dépôts **Ubuntu** (universe)
- Un clic → `apt-get install -y --no-install-recommends <paquet>` → le binaire se lance
- Les titres installés apparaissent dans la **Bibliothèque**
- Recherche par nom de jeu ou de paquet
- Sur live USB, les installs tiennent **en RAM** jusqu’au redémarrage — rien n’est écrit sur le disque dur

Exemples : SuperTux (`supertux` → `supertux2`), SuperTuxKart, 0 A.D. (`0ad`), Wesnoth, Xonotic, Hedgewars, Minetest, Frozen Bubble, MAME, RetroArch, etc.

## Flasher

1. Télécharge `arcadeos-*-amd64.iso` depuis [Releases](https://github.com/elieli1269/arcadeos/releases/tag/nightly)
2. [Ventoy](https://www.ventoy.net/) (drop le fichier) ou [balenaEtcher](https://etcher.balena.io/)
3. Ou : `sudo dd if=arcadeos-1.3.0-amd64.iso of=/dev/sdX bs=4M status=progress conv=fsync`

Compte : **gamer** / **gamer**. Root : `arcadeos`.

Dans le BIOS : USB first, **Secure Boot off** (l’ISO n’est pas signée Microsoft).

Matériel : **x86_64** (Intel / AMD). GPU optionnel — Mesa nouveau/NVK pour NVIDIA, sinon llvmpipe.

## Build (GitHub Actions)

Le workflow `.github/workflows/build-iso.yml` tourne sur `ubuntu-24.04` :

1. `debootstrap` noble minbase
2. Kernel generic + HWE + firmware + mesa + sway + greetd + jeux
3. Overlay kiosk + disk-guard (`overlay/`)
4. `mksquashfs` zstd + `grub-mkrescue`

Artifact + release `nightly`. Relance manuelle : Actions → **Build ArcadeOS ISO** → Run workflow.

## Build local

```bash
sudo apt-get install -y debootstrap squashfs-tools xorriso grub-pc-bin grub-efi-amd64-bin mtools dosfstools rsync
sudo ./scripts/build-iso.sh
# → out/arcadeos-1.3.0-amd64.iso
```

QEMU :

```bash
qemu-system-x86_64 -m 4096 -enable-kvm -cpu host -smp 4 \
  -cdrom out/arcadeos-1.3.0-amd64.iso -boot d -vga virtio
```

## Arborescence

```
scripts/build-iso.sh          # le builder
overlay/usr/bin/arcadeos-kiosk
overlay/usr/lib/arcadeos/disk-guard
overlay/opt/arcadeos/launcher # Big Picture (HTML) + store.js
.github/workflows/build-iso.yml
```

## Licence

MIT pour le launcher / les scripts. Ubuntu et les jeux restent sous leurs licences respectives.
