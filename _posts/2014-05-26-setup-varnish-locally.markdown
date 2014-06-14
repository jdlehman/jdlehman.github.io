---
layout: post
title:  "Setting Up Varnish Locally"
date:   2014-05-26
categories: varnish
---

Typically, the best way to ensure that a web application will run correctly in production is to
stage it an environment just like production. Most of the time the overhead of setting up caching or other
performance improvements is not necessary in development, but there are instances when the development
being done directly interacts with or relies upon these components. In these situations it often pays off
to take the time to set up "production components" so that changes can be tested prior to pushing changes
to a staging or production environment, often a costly extra step.

Today, I am going to focus on setting up [Varnish Cache](https://www.varnish-cache.org), a
"caching HTTP reverse proxy". Varnish allows you to cache responses to quickly serve common pages and
provides powerful configuration for response headers and other cache settings.

### Installation

If you are using Mac OSX, you can simply use [Homebrew](http://brew.sh/) to install Varnish.
{% highlight bash %}
brew install varnish
{% endhighlight %}

If you are using vanilla Varnish without any other modules, you can skip ahead to the [usage](#usage) section.
If you do not use brew, continue to follow along and we will install it from source.

### Installing Modules

Installing Varnish modules such as [libvmod-header](https://github.com/varnish/libvmod-header) or
[libvmod-cookie](https://github.com/lkarsten/libvmod-cookie) requires building them from source
using Varnish's source.

First we must build Varnish's source. Download a Varnish from their website or [github](https://github.com/varnish/Varnish-Cache).
{% highlight bash %}
cd /varnish-cache-source-location
./autogen.sh
./configure
make

# install varnish without brew (optional)
make install
{% endhighlight %}

***Note:*** If you get an rst2man error during compilation you need to [install docutils with pip](http://stackoverflow.com/a/12813081).

Now that we have built Varnish, we can use it to build our modules. For each module do as follows.
{% highlight bash %}
cd /varnish-module-location
./autogen.sh
./configure VARNISHSRC=/path-to-varnish-source
make
make install
{% endhighlight %}

This will install the module binaries to the correct location, allowing you to import the module
in your vcls. You can now configure `default.vcl` to your liking. It is located at
`/user/local/etc/varnish` on OSX.

### Usage

If you installed Varnish via brew, you can use `launchctl` and the `plist` files to load the
service, or you can use the `varnishd` command via the terminal. I recommend using the terminal initially
because this will allow you to see and debug any errors. The property list files will fail silently if there
are any errors.

{% highlight bash %}
# must run as root
sudo varnishd -f /usr/local/etc/varnish/default.vcl -s file -a 0.0.0.0:8000
# help: see available arguments with descriptions
varnishd -h
{% endhighlight %}

***Command Breakdown***

* `-f` Specifies the location of the `vcl` script to launch Varnish with.
* `-s` Specifies storage options. The file argument stores in `/tmp` by default. You can
specify another location with `-s file,/location`
* `-a` Specifies the address and port that Varnish will run at. You can access your website
through Varnish using this address and port.

By now you should be up and running with Varnish locally on your development environment.
For more information on Varnish in general and writing vcl scripts, consult the
[documentation](https://www.varnish-cache.org/docs).
