---
title: Tailscale as a personal VPN
description: How I use Tailscale to connect virtually all my devices
keywords:
  - tailscale
  - vpn
createdAt: 2025-11-08
updatedAt: 2025-11-08
---

# Tailscale as a personal VPN

Tailscale is my personal VPN that connects virtually all my devices.  
It offers a generous free plan that allows up to 100 devices and 3 users.  
It supports virtually all type of devices that I have: iPhone, iPad, Macbook Pro, Apple TV, Mac Mini and Raspberry Pis.

### VPN = securely connect my devices

The main purpose of the personal VPN is to create a **secure** virtual network to connect all my devices together.

Tailscale allows you to connect both traditional clients that have a GUI like an iPhone or an Apple TV but also headless servers like a Raspberry Pi running Linux.

<img class="border border-gray-300 max-w-100" alt="add device menu" src="/images/tailscale_add_device.png" />

### Make it easy to connect to different devices

Tailscale also offers out of the box what they call [Magic DNS](https://tailscale.com/kb/1081/magicdns) which is a fantastic feature that allows you to easily connect to your devices by using a machine name instead of its IP address.

This is very convenient when you have a few devices and you can configure specific machine names like `iphone-mattia`, `rpi5-london` or `mac-mini-italy`.

```sh
$ ssh username@100.12.100.24 # without Magic DNS
$ ssh username@rpi5-london # with Magic DNS 🎉
```

### Remotely manage my servers and connect services

I have a bunch of Raspberry Pi in 2 different locations and using Tailscale makes it easier for me to access them remotely no matter where I am.

On top of that I can also easily connect services that are running in different servers in different locations without the need to configure static IP addresses or port forwarding rules.

```sh
# from rp5-london
$ curl -I rpi5-italy:1234/my-service
```

### Use different exit nodes when needed

This allows me to watch content and subscription from my home country also when I'm abroad.  
All you need is device that's always connected like a Raspberry Pi or even an Apple TV in standby works.

Once you configure a device to be an exit node, you will also need to enable it in the dashboard.
Click on that machine `Edit route settings...` and enable the exit node.

<img class="max-w-100" alt="exit node device" src="/images/tailscale_exit_node_setup.png" />

For convenience **I disable the key expire only on the devices that I keep home** and always connected so I will never need to re-authenticate again the machine.

<img class="border border-gray-300" alt="exit node device" src="/images/tailscale_exit_node.png" />

Once enabled you will see a badge and it will become available to be used by your other devices, for example this is a screenshot from the iOS client:

<img class="border border-gray-300" alt="exit node device" src="/images/tailscale_exit_node_enabled.png" />

### Centrally manage DNS

I use NextDNS as a provider and Tailscale allows me to easily integrate with a custom Nameserver so I can force DNS resolution on all my devices no matter what network I'm connected to.

<img class="border border-gray-300" alt="exit node device" src="/images/tailscale_nameservers.png" />
