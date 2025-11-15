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

When people talk about a VPN they commonly refer to a paid service that allows them to safely surf the internet with a global network of servers to choose from.

Tailscale instead is a **personal VPN** that allows me to create a **secure** virtual network to connect all my devices together.

I use it both on traditional clients that have a GUI like an iPhone or Apple TV but also on headless servers like a Raspberry Pi running Linux.

<img class="border border-gray-300 max-w-100" alt="add device menu" src="/images/tailscale_add_device.png" />

### Make it easy to connect to different devices

Tailscale offers out of the box what they call [Magic DNS](https://tailscale.com/kb/1081/magicdns) which is a fantastic feature that allows me to easily connect to my devices by using a machine name instead of its IP address.

Machine names are very easy to remember and I can create custom names like `iphone-mattia`, `rpi5-london` or `mac-mini-italy`.

```sh
$ ssh username@100.12.100.24 # without Magic DNS
$ ssh username@rpi5-london # with Magic DNS 🎉
```

### Remotely manage my servers and connect services

I have a bunch of Raspberry Pi in 2 different locations and Tailscale makes it easier for me to access them remotely no matter where I am.

On top of that I can also connect services that are running in different servers in different locations without the need to configure static IP addresses or port forwarding rules.

```sh
# from rp5-london
$ curl -I rpi5-italy:1234/my-service
```

### Use different exit nodes when needed

As a personal VPN Tailscale doesn't offer any exit nodes like traditional VPNs that offer a global presence of servers but that doesn't mean that I can't have different exit nodes with Tailscale.

An exit node is a client that runs Tailscale allowing traffic from other devices on the network to "exit" from its internet connection.

Exit nodes must be configured and enabled in the Tailscale dashboard.

<img class="max-w-100" alt="exit node device" src="/images/tailscale_exit_node_setup.png" />

For me the most common use case for using a different exit node rather than my current internet connection is to to watch content and subscription from my home country also when I'm abroad.  
At the end all is needed is a client that's always connected like a Raspberry Pi or even an Apple TV in standby works.

<img class="border border-gray-300" alt="exit node device" src="/images/tailscale_exit_node.png" />

For convenience **I disable the key expire only on the devices that I keep home** and always connected so I will never need to re-authenticate again the machine.

Once the exit node is enabled it shows a badge and it becomes available to be used by other devices, for example this is a screenshot of my iPhone Tailscale iOS client:

<img class="border border-gray-300" alt="exit node device" src="/images/tailscale_exit_node_enabled.png" />

### Centrally manage DNS

I use NextDNS as a provider and Tailscale allows me to easily integrate with a custom Nameserver so I can force DNS resolution on all my devices no matter what network I'm connected to.

<img class="border border-gray-300" alt="exit node device" src="/images/tailscale_nameservers.png" />
