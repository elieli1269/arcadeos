#!/usr/bin/env bash
# ArcadeOS ISO builder — Ubuntu 24.04 (noble) live image, kiosk session, no desktop.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${WORK_DIR:-$ROOT/work}"
OUT="${OUT_DIR:-$ROOT/out}"
CHROOT="$WORK/chroot"
ISO="$WORK/iso"
VERSION="$(tr -d '[:space:]' < "$ROOT/VERSION" 2>/dev/null || echo 1.0.0)"
LABEL="ARCADEOS"
MIRROR="${UBUNTU_MIRROR:-http://archive.ubuntu.com/ubuntu}"
RELEASE="${UBUNTU_RELEASE:-noble}"
MIRRORS=(
  "$MIRROR"
  "http://archive.ubuntu.com/ubuntu"
  "http://azure.archive.ubuntu.com/ubuntu"
  "http://security.ubuntu.com/ubuntu"
)

log() { printf '[arcadeos] %s\n' "$*"; }
die() { printf '[arcadeos] ERROR: %s\n' "$*" >&2; exit 1; }

need_root() { [[ "$(id -u)" -eq 0 ]] || die "run as root (sudo ./scripts/build-iso.sh)"; }

cleanup_mounts() {
  if [[ -d "$CHROOT" ]]; then
    umount -lf "$CHROOT/dev/pts" 2>/dev/null || true
    umount -lf "$CHROOT/dev" 2>/dev/null || true
    umount -lf "$CHROOT/proc" 2>/dev/null || true
    umount -lf "$CHROOT/sys" 2>/dev/null || true
    umount -lf "$CHROOT/run" 2>/dev/null || true
  fi
}
trap cleanup_mounts EXIT

run_chroot() {
  chroot "$CHROOT" /usr/bin/env -i \
    HOME=/root TERM=xterm DEBIAN_FRONTEND=noninteractive LANG=C.UTF-8 \
    PATH=/usr/sbin:/usr/bin:/sbin:/bin \
    "$@"
}

need_root
command -v debootstrap >/dev/null || die "debootstrap missing"
command -v mksquashfs >/dev/null || die "squashfs-tools missing"
command -v grub-mkrescue >/dev/null || die "grub-mkrescue missing (grub-common / grub-pc-bin)"

rm -rf "$WORK"
mkdir -p "$CHROOT" "$ISO/live" "$ISO/boot/grub" "$OUT"

bootstrapped=0
for m in "${MIRRORS[@]}"; do
  [[ -n "$m" ]] || continue
  log "debootstrap $RELEASE minbase ($m)"
  rm -rf "$CHROOT"
  mkdir -p "$CHROOT" "$ISO/live" "$ISO/boot/grub" "$OUT"
  if debootstrap --verbose --arch=amd64 --variant=minbase \
      --include=ca-certificates,systemd-sysv,dbus,sudo \
      "$RELEASE" "$CHROOT" "$m"; then
    MIRROR="$m"
    bootstrapped=1
    break
  fi
  log "debootstrap failed on $m — next mirror"
done
[[ "$bootstrapped" -eq 1 ]] || die "debootstrap failed on all mirrors"

log "bind mounts"
mkdir -p "$CHROOT/dev/pts" "$CHROOT/proc" "$CHROOT/sys" "$CHROOT/run"
mount -t proc proc "$CHROOT/proc"
mount -t sysfs sysfs "$CHROOT/sys"
mount --bind /dev "$CHROOT/dev"
mount --bind /dev/pts "$CHROOT/dev/pts"
mount -t tmpfs tmpfs "$CHROOT/run"

log "apt sources + no-snap"
cat > "$CHROOT/etc/apt/sources.list" <<EOF
deb $MIRROR $RELEASE main restricted universe multiverse
deb $MIRROR $RELEASE-updates main restricted universe multiverse
deb $MIRROR $RELEASE-backports main restricted universe
deb http://security.ubuntu.com/ubuntu $RELEASE-security main restricted universe multiverse
EOF

cat > "$CHROOT/etc/apt/preferences.d/nosnap.pref" <<'EOF'
Package: snapd
Pin: release *
Pin-Priority: -10
EOF

cat > "$CHROOT/usr/sbin/policy-rc.d" <<'EOF'
#!/bin/sh
exit 101
EOF
chmod +x "$CHROOT/usr/sbin/policy-rc.d"

cp /etc/resolv.conf "$CHROOT/etc/resolv.conf"
cat > "$CHROOT/etc/apt/apt.conf.d/80retries" <<'EOF'
Acquire::Retries "5";
Acquire::http::Timeout "30";
Acquire::https::Timeout "30";
EOF

log "install base + kiosk + games"
run_chroot apt-get update
run_chroot apt-get install -y --no-install-recommends \
  linux-image-generic linux-firmware intel-microcode amd64-microcode \
  initramfs-tools live-boot live-boot-initramfs-tools live-tools kmod udev \
  locales tzdata kbd console-setup \
  network-manager wpasupplicant wireless-regdb rfkill iproute2 iputils-ping \
  mesa-vulkan-drivers libgl1-mesa-dri mesa-utils libvulkan1 \
  seatd greetd sway foot libcairo2 \
  python3 python3-gi python3-gi-cairo gir1.2-gtk-3.0 gir1.2-webkit2-4.1 \
  pipewire pipewire-pulse wireplumber libspa-0.2-bluetooth alsa-utils \
  policykit-1 pkexec dbus-user-session libpam-systemd \
  fonts-noto-core fonts-noto-mono \
  neverball pingus lbreakout2 \
  nano less pciutils usbutils util-linux mount \
  ${EXTRA_PACKAGES:-}

# Newer kernel for recent NVIDIA (nouveau/NVK). Keep generic if HWE is missing.
if run_chroot apt-get install -y --no-install-recommends linux-image-generic-hwe-24.04; then
  log "HWE kernel installed"
else
  log "HWE kernel unavailable — keeping linux-image-generic"
fi

run_chroot apt-get clean
rm -rf "$CHROOT/var/cache/apt/archives/"*

log "locale + identity"
echo "en_US.UTF-8 UTF-8" > "$CHROOT/etc/locale.gen"
echo "fr_FR.UTF-8 UTF-8" >> "$CHROOT/etc/locale.gen"
run_chroot locale-gen
echo 'LANG=fr_FR.UTF-8' > "$CHROOT/etc/default/locale"
echo 'arcadeos' > "$CHROOT/etc/hostname"
cat > "$CHROOT/etc/hosts" <<'EOF'
127.0.0.1 localhost arcadeos
::1       localhost
EOF

cat > "$CHROOT/etc/os-release" <<EOF
PRETTY_NAME="ArcadeOS $VERSION"
NAME="ArcadeOS"
VERSION_ID="$VERSION"
VERSION="$VERSION (noble)"
ID=arcadeos
ID_LIKE="ubuntu debian"
HOME_URL="https://github.com/elieli1269/arcadeos"
SUPPORT_URL="https://github.com/elieli1269/arcadeos/issues"
BUG_REPORT_URL="https://github.com/elieli1269/arcadeos/issues"
UBUNTU_CODENAME=noble
LOGO=arcadeos
EOF

cat > "$CHROOT/etc/lsb-release" <<EOF
DISTRIB_ID=ArcadeOS
DISTRIB_RELEASE=$VERSION
DISTRIB_CODENAME=noble
DISTRIB_DESCRIPTION="ArcadeOS $VERSION"
EOF

log "user gamer"
run_chroot useradd -m -s /bin/bash -G sudo,audio,video,plugdev,netdev,render,input,adm gamer || true
run_chroot usermod -aG sudo,audio,video,plugdev,netdev,render,input,adm gamer
if run_chroot getent group seat >/dev/null; then
  run_chroot usermod -aG seat gamer
fi
echo 'gamer:gamer' | chroot "$CHROOT" chpasswd
echo 'root:arcadeos' | chroot "$CHROOT" chpasswd
echo 'gamer ALL=(ALL) NOPASSWD:ALL' > "$CHROOT/etc/sudoers.d/gamer"
chmod 440 "$CHROOT/etc/sudoers.d/gamer"

log "overlay"
if [[ -d "$ROOT/overlay" ]]; then
  rsync -a "$ROOT/overlay/" "$CHROOT/"
fi
chmod +x "$CHROOT/usr/bin/"arcadeos-* 2>/dev/null || true
chmod +x "$CHROOT/usr/lib/arcadeos/"* 2>/dev/null || true

# greetd + sway kiosk
mkdir -p "$CHROOT/etc/greetd" "$CHROOT/etc/arcadeos" "$CHROOT/etc/polkit-1/rules.d"
cat > "$CHROOT/etc/greetd/config.toml" <<'EOF'
[terminal]
vt = 1

[default_session]
command = "sway --config /etc/arcadeos/sway.config"
user = "gamer"
EOF

cat > "$CHROOT/etc/arcadeos/sway.config" <<'EOF'
font pango:Noto Sans 12
output * bg #07080c solid_color
default_border none
default_floating_border none
titlebar_padding 0
hide_edge_borders both
focus_follows_mouse no
bar { mode invisible }

input type:touchpad {
    tap enabled
    natural_scroll enabled
}

set $term foot
bindsym Mod4+Return exec $term
bindsym Mod4+Escape exec /usr/bin/arcadeos-kiosk
bindsym XF86PowerOff exec systemctl poweroff -i

for_window [app_id="arcadeos-kiosk"] fullscreen enable
for_window [class="Neverball"] fullscreen enable
for_window [class="neverball"] fullscreen enable
for_window [class="Pingus"] fullscreen enable
for_window [class="pingus"] fullscreen enable
for_window [class="lbreakout2"] fullscreen enable
for_window [class="LBreakout2"] fullscreen enable

exec dbus-update-activation-environment --systemd DISPLAY WAYLAND_DISPLAY XDG_CURRENT_DESKTOP SWAYSOCK
exec /usr/bin/arcadeos-session-audio
exec /usr/bin/arcadeos-kiosk
EOF

mkdir -p "$CHROOT/usr/bin"
cat > "$CHROOT/usr/bin/arcadeos-session-audio" <<'EOF'
#!/bin/sh
pipewire >/tmp/pipewire.log 2>&1 &
pipewire-pulse >/tmp/pipewire-pulse.log 2>&1 &
wireplumber >/tmp/wireplumber.log 2>&1 &
exit 0
EOF
chmod +x "$CHROOT/usr/bin/arcadeos-session-audio"

cat > "$CHROOT/etc/polkit-1/rules.d/10-arcadeos.rules" <<'EOF'
polkit.addRule(function(action, subject) {
    if (subject.user == "gamer") {
        if (action.id.indexOf("org.freedesktop.login1.") == 0) return polkit.Result.YES;
        if (action.id.indexOf("org.freedesktop.NetworkManager.") == 0) return polkit.Result.YES;
    }
});
EOF

log "live USB hardening — never touch the internal HDD"
mkdir -p \
  "$CHROOT/etc/systemd/system-generators" \
  "$CHROOT/etc/initramfs-tools/conf.d" \
  "$CHROOT/etc/live" \
  "$CHROOT/usr/lib/arcadeos"

# Mask generators that probe ATA/NVMe for LUKS, GPT auto-root, hibernate resume.
ln -sfn /dev/null "$CHROOT/etc/systemd/system-generators/systemd-gpt-auto-generator"
ln -sfn /dev/null "$CHROOT/etc/systemd/system-generators/systemd-cryptsetup-generator"
ln -sfn /dev/null "$CHROOT/etc/systemd/system-generators/systemd-hibernate-resume-generator"
ln -sfn /dev/null "$CHROOT/etc/systemd/system-generators/systemd-integritysetup-generator"

# fstab/crypttab from overlay may be missing on a partial tree — force safe copies.
cat > "$CHROOT/etc/fstab" <<'EOF'
# ArcadeOS live — tmpfs only. Internal disks are never listed, never fsck'd.
tmpfs /tmp tmpfs nosuid,nodev,mode=1777 0 0
tmpfs /var/tmp tmpfs nosuid,nodev,mode=1777 0 0
EOF
: > "$CHROOT/etc/crypttab"
echo 'RESUME=none' > "$CHROOT/etc/initramfs-tools/conf.d/resume"
cat > "$CHROOT/etc/initramfs-tools/conf.d/arcadeos" <<'EOF'
WAIT=12
CRYPTSETUP=n
EOF

run_chroot systemctl enable arcadeos-disk-guard.service || true
run_chroot systemctl mask hibernate.target hybrid-sleep.target suspend-then-hibernate.target cryptsetup.target || true

log "systemd targets"
run_chroot systemctl enable greetd || true
run_chroot systemctl enable NetworkManager || true
run_chroot systemctl enable seatd || true
run_chroot systemctl set-default graphical.target
run_chroot systemctl disable getty@tty1 || true
ln -sfn /lib/systemd/system/greetd.service "$CHROOT/etc/systemd/system/display-manager.service"
run_chroot systemctl disable systemd-networkd || true
run_chroot systemctl disable systemd-networkd.socket || true

# live-boot: rebuild initramfs now that hooks exist
log "initramfs"
run_chroot update-initramfs -u -k all

log "cleanup chroot"
rm -f "$CHROOT/usr/sbin/policy-rc.d"
truncate -s 0 "$CHROOT/etc/machine-id" || true
rm -f "$CHROOT/var/lib/dbus/machine-id"
rm -rf "$CHROOT/tmp/"* "$CHROOT/var/tmp/"* "$CHROOT/var/log/"* "$CHROOT/root/.bash_history" || true
: > "$CHROOT/etc/resolv.conf"

cleanup_mounts
trap - EXIT

KIMAGE="$(ls -1 "$CHROOT/boot"/vmlinuz-* 2>/dev/null | sort | tail -1 || true)"
IIMAGE="$(ls -1 "$CHROOT/boot"/initrd.img-* 2>/dev/null | sort | tail -1 || true)"
[[ -n "$KIMAGE" && -n "$IIMAGE" ]] || die "kernel/initrd not found in chroot /boot"
cp "$KIMAGE" "$ISO/live/vmlinuz"
cp "$IIMAGE" "$ISO/live/initrd.img"

log "squashfs"
mksquashfs "$CHROOT" "$ISO/live/filesystem.squashfs" \
  -comp zstd -Xcompression-level 10 -noappend \
  -e boot/initrd.img-* boot/vmlinuz-* proc sys dev tmp run \
     var/cache/apt/archives

printf '%s\n' "$(du -sb "$CHROOT" | cut -f1)" > "$ISO/live/filesystem.size"

cat > "$ISO/boot/grub/grub.cfg" <<'EOF'
insmod all_video
insmod gfxterm
insmod iso9660
insmod part_gpt
insmod part_msdos
insmod ext2
terminal_output gfxterm
set timeout=6
set default=0
set menu_color_normal=white/black
set menu_color_highlight=black/light-gray

# RAM overlay, no swap, no LUKS, no resume from the internal disk.
set live_safe="boot=live components username=gamer hostname=arcadeos timezone=Europe/Paris nopersistent noswap noluks nolvm nodmraid live-media-path=/live live-media-timeout=15 noresume resume=none systemd.gpt_auto=0 rd.luks=0 rd.lvm=0 rd.md=0 rd.dm=0 fsck.mode=skip fsck.repair=no"

menuentry "ArcadeOS — clé USB (disque dur intact)" {
    if [ ! -e /live/vmlinuz ]; then
        search --no-floppy --file --set=root /live/vmlinuz
    fi
    linux /live/vmlinuz $live_safe quiet splash
    initrd /live/initrd.img
}

menuentry "ArcadeOS — graphismes sûrs (NVIDIA / sans GPU)" {
    if [ ! -e /live/vmlinuz ]; then
        search --no-floppy --file --set=root /live/vmlinuz
    fi
    linux /live/vmlinuz $live_safe nomodeset nouveau.modeset=0 nvidia.modeset=0 i915.modeset=0 amdgpu.modeset=0 radeon.modeset=0
    initrd /live/initrd.img
}

menuentry "ArcadeOS — copie en RAM (tu peux retirer la clé)" {
    if [ ! -e /live/vmlinuz ]; then
        search --no-floppy --file --set=root /live/vmlinuz
    fi
    linux /live/vmlinuz $live_safe toram quiet splash
    initrd /live/initrd.img
}

menuentry "ArcadeOS — USB strict (ignore les disques internes)" {
    if [ ! -e /live/vmlinuz ]; then
        search --no-floppy --file --set=root /live/vmlinuz
    fi
    linux /live/vmlinuz $live_safe live-media=removable-usb quiet splash
    initrd /live/initrd.img
}
EOF

ISO_NAME="arcadeos-${VERSION}-amd64.iso"
log "grub-mkrescue -> $ISO_NAME"
grub-mkrescue --compress=xz -o "$OUT/$ISO_NAME" "$ISO" \
  -- -volid "$LABEL"

( cd "$OUT" && sha256sum "$ISO_NAME" | tee SHA256SUMS )

log "ISO ready: $OUT/$ISO_NAME ($(du -h "$OUT/$ISO_NAME" | cut -f1))"
file "$OUT/$ISO_NAME" || true
