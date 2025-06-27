# Deep-School
## From Carnation Studios

Deep-School is simply a platform to support learning.

Deep-School was first conceived in 2022.

At first, it was planned in the form of a study consultation room, but we realized that students needed more functions.
students needed more functions, so Deep-School was developed in the form of Deep-Fried.

Deep-School was developed from scratch in the spirit of Deep-Fried, to make it even easier to use and more adaptable to the workplace.
The most important feature of this platform is the ability to use the software in a way that is easy to use and familiar to the field.

The most important feature of this platform is that students can be supported in their learning activities by other students in addition to the teacher.
The most important feature of this platform is that students can be supported in their learning activities by other students in addition to the teacher.

When a student does not understand something, he/she can ask another student to help him/her solve the problem.

Students from all over the country can use teaching materials created by teachers from all over the country.

Students can point out areas for improvement to their teachers.

This is the most important feature of Deep-School.

Deep-School consists of the following three main software components

# SCR

SCR is the English acronym for "Study Consultation Room".

This application allows students to freely discuss their studies.

It is a social networking application where everyone can ask and answer questions.

These activities can be constantly viewed by the teacher.

If necessary, the results can be communicated. The network can then be used as a network of computers, with specialized software installed on any computer.

The network can then be created separately by installing specialized software on any computer. Then, users who can access the created network can be assigned to the network.
And, users who can access the created network can be set.

You can have a nationwide network or a subject-based network. This is SCR.

I believe that real learning is when students learn and think from each other.

This is what this application is all about.

# Work

Work is a free software application that allows students to use all the teaching materials for all subjects.

The work provided in this application is authored by teachers.

Work is also built on a number of networks, so that work can be made available on a school-by-school basis or nationwide.
The work can be made public by school or by the whole country.

In addition, by connecting with a service that shares teaching materials (e.g., Sensei Ichiba), teachers can get ideas for teaching materials that they can use.
The service can also be linked to educational material sharing services (e.g., Sensei Ichiba).

We believe that it is not good to have a gap between students who cannot go to cram school and those who can.

That is why we are planning and developing software that will allow everyone to use all the materials free of charge.
Therefore, we are planning and developing software that will allow all students to use all the materials free of charge.

# ToasterMachine

ToasterMachine is an AI tool customized for the educational field.

ToasterMachine is a custom AI tool for educational use. It was created along the lines of "coaching".

In conventional AI tools, the answer is given as soon as the "Tell me the answer" is pronounced.

Is this really beneficial to the child?

In order to address this problem, a "coaching" = "guiding the answer" method was introduced,

ToasterMachine.

# Version Management System

Deep-School uses a comprehensive version management system to track versions across all components.

## Version Formats

### Deep-School Client/Server/Pickramu
Format: `v.CYCLE.RELEASE.REVISION(.STATUS)`
- **CYCLE**: 1-year cycle (10/13, 10/03, 4/15, 9/1)
- **RELEASE**: Irregular releases when features are stable (1, 5, 10, 25, 30)
- **REVISION**: Security patches and bug fixes
- **STATUS**: Optional (nightly, beta, pre)

Examples:
- `v1.3.2` - 1st cycle, 3rd release, revision 2
- `v3.12.6.nightly` - 3rd cycle, 12th release, revision 6 (nightly)

### Toaster-Machine
Format: `v.CYCLE.RELEASE.REVISION`
- **CYCLE**: 1/2-year cycle (10/13, 10/03, 4/15, 9/1, 8/1, 12/26)
- **RELEASE**: Irregular releases when features are stable
- **REVISION**: Security patches and bug fixes

Example: `v1.3.2` - 1st cycle, 3rd release, revision 2

### Deep-School Family Software
Format: `YEAR(FIRST-CODE-RELEASED-YEAR)C[BUILD][RELEASE](.STATUS)`
- **YEAR**: First code released year (e.g., 2025 → 25)
- **BUILD**: Build number
- **RELEASE**: Release number
- **STATUS**: Optional (nightly, beta, pre)

Example: `25C1205` - 2025, build 12, release 5

## Using Version Management

### Command Line Interface

```bash
# Show all version information
npm run version:all
# or
node version-cli.js all

# Show specific component version
npm run version:client
npm run version:server
npm run version:pickramu
npm run version:toaster
npm run version:family

# List available components
npm run version:list

# Check for updates
npm run version:check

# Compare versions
node version-cli.js compare 1.0.1 1.0.2

# Show help
npm run version:help
```

### Deep-Shell Integration

When using Deep-School in the browser, you can access version information through the Deep-Shell:

```javascript
// Show all version information
ds.version.all()

// Show specific component version
ds.version.get('client')
ds.version.get('server')
ds.version.get('pickramu')
ds.version.get('toaster')
ds.version.get('family')

// List available components
ds.version.list()

// Check for updates
ds.version.check()

// Compare versions
ds.version.compare('1.0.1', '1.0.2')

// Show help
ds.help.version()
```

## Release Schedule

- **Deep-School Cycles**: 10/13, 10/03, 4/15, 9/1
- **Toaster-Machine Cycles**: 10/13, 10/03, 4/15, 9/1, 8/1, 12/26
- **Release Days**: 1, 5, 10, 25, 30
- **Family Software Updates**: When cycles align

__________________________________

This system is developed by Carnation Studio.
At this time, no license has been set up.
Please do not do anything yet, as we will release it soon (fork, use of code, citation).

___________________________________

(C) 2022-2025 Carnation Studio All Rights Reserved.