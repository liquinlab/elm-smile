# :artist: Designing Quality Experiments

Designing good web based experiments is a deceivingly complex task. At the most
basic level, a web experiment is simply a web page that presents stimuli and
records people's responses. Such technology has been around for decades and is
pretty simple in most cases.

However, several factors have conspired to make designing web experiments more
complex.

- The web is a complex environment with many different browsers, devices, and
  operating systems. This means that web experiments need to be designed to work
  across a wide range of platforms.
- Institutional Review Boards at most universities have become more concerned
  about subject privacy and data security. This means that web experiments need
  to be protect the anonymity of participants and the security of their data.
- Most human subjects research _requires_ that participants provide informed
  consent and that they are free to _withdraw_ from the study at any time.
  Handling the logic of withdrawing and reporting this adds complexity to
  experiments.
- Researchers increasingly turn towards paid participant pools like Amazon
  Mechanical Turk to recruit participants. This means that web experiments need
  to be designed to work in a way that is compatible with these varied
  platforms.
- Workers on paid platforms like Amazon Mechanical Turk have become more
  sophisticated at bypassing attention checks and other quality control
  measures. This means that web experiments need to be designed to prevent
  cheating and data corruption by bots and AI-assisted workers (at least for
  most psychological studies).
- Expectations of users about the quality of web experiences is increasing.
  Worker may be less interested and engaged with tasks which seems old, buggy,
  or do not work well in their browser.
- Research questions in psychology and cognitive science are becoming more
  complex. This means that web experiments need to be designed to handle more
  complex experimental designs and data collection strategies. This include
  group and multi-player experiments, longitudinal studies, and more. Interfaces
  might need to be more interactive and complex than simple stimulus-response
  tasks.

There are several other dimension that are important:

- Reducing bugs introduced by sloppy programming is important for the
  replicability of research.
- Fasciliating the sharing of code and materials is important for the
  transparency of research.

The <SmileText/> project was designed with these sets of considerations in mind.
The focus is on making it easy to design and deploy high-quality web
experiments. While Smile can be used for simple stimulus-response type tasks, it
is easily capable of handling more complex experimental designs. This is
accomplished by leveraing state of the art web technologies and best practices
in web development. Smile doesn't reinvent the wheel by making an entirely new
web framework. Instead it leverages the currently best tools for building high
quality web applications use in industry.
