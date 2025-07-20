# Persistence

A key concept of Smile is the idea of _persistence_. Persistence refers to the
fact that information about the application is preserved across page reloads.
When you record data from your experiment in a database that is one kind of
persistence. Another is when information about the current application survives
across page reloads. It is fairly common for participants to reload their
browser window, or to close a window and reopen it at another time. In most
experiment frameworks, the task begins anew when a participant does this which
can be problematic for certain research questions. Instead, Smile makes it easy
to persist variables in a way that they will survive page reloads.

Persistence has several important effects on how Smile applications behave both
during development and during "live" data collection.
