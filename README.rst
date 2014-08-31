
Twoot is a customizable minimal twitter client for WebKit-based SSBs. It is based on jQuery_, Fluid_ and some basic HTML and CSS. The idea is to provide a native-looking application that is easy to customize to your specific needs.

.. _jQuery: http://jquery.com/
.. _Fluid: http://fluidapp.com/

This version was forked from Travis Jeffery's version.

.. image:: http://18.media.tumblr.com/3jJyzeT8jkoczwwgHclEugYIo1_400.png

Installation
------------

Put all Twoot files in a folder somewhere. Download Fluid and create the Twoot.app by following the instructions here:

http://www.peterkrantz.com/2008/twitter-client-with-fluid-and-jquery/

Launching the app will prompt you for your username and password on the first run.

The code should also work directly in Safari and other WebKit-based browsers (including the iPhone).

License
-------

MIT

Customization
-------------

The idea is that you should adapt Twoot to fit your requirements. If you know HTML and CSS it is trivial to add a new style. Create a new folder under the style directory and add all style files (css/images) there. Don't forget to change the stylesheet link in the twoot.htm file.

If you want to modify the way Twoot works, all javascript code is in the twoot.js file.

Bugs, praise, feature requests
------------------------------
tony@tmtm.com

Thanks
------

`Peter Krantz`_ for the original code and idea. `Travis Jeffery`_ for lots of work after that. The original twitter javascript code was inspired by the `SeaOfClouds tweet code`_.

.. _Peter Krantz: http://www.peterkrantz.com/
.. _Travis Jeffery: http://travisjeffery.com/
.. _SeaOfClouds tweet code: http://tweet.seaofclouds.com/

