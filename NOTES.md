--------------------------------------------------------------------------------

How about a world where you click to place plants, herbivores, and carnivores,
and plants also optionally spawn randomly. Then the herbivores and carnivores
can evolve to survive and reproduce! With real fake genetics! Build it
iteratively.

First, just predator and prey. Pit them against each other so the herbavore
avoids the predator and the carnivore chases the prey.

--------------------------------------------------------------------------------

<http://www.html5gamedevs.com/topic/19226-rendering-game-after-update/>
Separate updating and rendering so you can disable rendering, jack up the clock
speed and run the simulation way faster. Toggle between these with a button:

    { speed: NORMAL_SPEED, render: true } <=> { speed: FAST_SPEED, render: false }

--------------------------------------------------------------------------------

Change

    Generation: 143

to

    Generation: 143 (step 256/500)

--------------------------------------------------------------------------------

Prime Specimens View

Put a copy of the most fit creature from each population from the current
generation in a little box so you can watch it do it's ting in isolation and
observe emergent patterns without the noise of the collisions in the full
simulation.

--------------------------------------------------------------------------------

Make Prey Smarter

Prey should get fitness points for surviving an encounter with a predator.

--------------------------------------------------------------------------------

Add Genes

* Mass

--------------------------------------------------------------------------------

Impart force instead of setting acceleration!

--------------------------------------------------------------------------------
