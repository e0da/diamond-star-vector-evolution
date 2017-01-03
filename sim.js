'use strict'

var ALPHA_POPULATION_SIZE = 20
var BETA_POPULATION_SIZE = 400
var POPULATION_SIZE = ALPHA_POPULATION_SIZE + BETA_POPULATION_SIZE

var GENE_LENGTH = 1000, GENOME_LENGTH = 2
var SUMMARY = `Generation: %s
Alpha fitness: %s
Beta fitness: %s`

var SPEED = 200
var ALPHA_MASS = 2
var BETA_MASS = 1
var BOUNCE = 0.1
var DAMAGE = 0.34
var MUTATION_RATE = 0.1
var ALPHA_OLD_AGE = 3
var BETA_OLD_AGE = 5

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game',
                       { preload: preload, create: create, update: update })

var population, summary, generation, step

var fitness = {
  alpha: function (creature) {
    return creature.score
  },

  beta: function (creature) {
    return age(creature)
  }
}

var oldAge = {
  alpha: ALPHA_OLD_AGE,
  beta: BETA_OLD_AGE,
}

var populationSize = {
  alpha: ALPHA_POPULATION_SIZE,
  beta: BETA_POPULATION_SIZE,
}

var mass = {
  alpha: ALPHA_MASS,
  beta: BETA_MASS,
}

function preload() {
  game.load.image('alpha', 'assets/diamond.png')
  game.load.image('beta', 'assets/star.png')
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE)

  generation = 1
  step = 0

  population = {}

  let groupNames = ['alpha', 'beta']
  for (let i = 0; i < groupNames.length; i++) {
    let group = game.add.physicsGroup()
    group.name = groupNames[i]
    group.fitness = fitness[group.name]
    population[group.name] = group
    group.populationSize = populationSize[group.name]
  }

  for (let i = 0; i < ALPHA_POPULATION_SIZE; i++) {
    createRandomCreature(population.alpha)
  }

  for (let i = 0; i < BETA_POPULATION_SIZE; i++) {
    createRandomCreature(population.beta)
  }

  summary = document.getElementById('summary')
}

function update() {
  summary.innerText = summaryText()

  let creatures = population.alpha.children.concat(population.beta.children)

  if (step++ > GENE_LENGTH) {
    generation++
    step = 0
    evolve()
    return
  }


  for (let i = 0; i < creatures.length; i++) {
    let creature = creatures[i]
    if (age(creature) > oldAge[creature.group]) {
      die(creature)
    }
    let genome = creature.genome
    creature.body.acceleration.x = speed(genome[0][step])
    creature.body.acceleration.y = speed(genome[1][step])
  }

  population.beta.children.map(function (creature) {
    if (creature.alive) creature.score += 1
  })

  game.physics.arcade.collide(population.alpha)
  game.physics.arcade.collide(population.beta)
  game.physics.arcade.collide(population.alpha, population.beta, bite)
}

function randomGenome() {
  let genome = []
  for (let i = 0; i < GENOME_LENGTH; i++) {
    let gene = []
    for (let j = 0; j < GENE_LENGTH; j++) {
      gene.push(Math.random())
    }
    genome.push(gene)
  }
  return genome;
}

function randomLocation() {
  return new Phaser.Point(game.rnd.integerInRange(0, game.width),
                          game.rnd.integerInRange(0, game.height))
}

function createCreature(group, genome, location) {
  let creature = group.create(location.x, location.y, group.name)
  creature.genome = randomGenome()
  creature.score = 0
  creature.group = group
  creature.generation = generation
  creature.body.collideWorldBounds = true
  creature.body.bounce.x = creature.body.bounce.y = BOUNCE
  creature.body.mass = mass[group.name]
}

function createRandomCreature(group) {
  createCreature(group, randomGenome(), randomLocation())
}

function speed(gene) {
  return Math.floor(2 * SPEED * gene) - SPEED
}

function bite(alpha, beta) {
  beta.health -= DAMAGE
  if (beta.health < 0) {
    alpha.score += 2
    die(beta)
  }
  alpha.score += 1
}

function breed(left, right) {
  // screen for viability
  var genome = []
  for (let i = 0; i < GENOME_LENGTH; i++) {
    let leftDonor = game.rnd.pick([left, right])
    let rightDonor = leftDonor == left ? right : left
    let leftHalf = leftDonor.genome[i].slice(0, GENE_LENGTH)
    let rightHalf = rightDonor.genome[i].slice(GENE_LENGTH, -1)
    let gene = leftHalf.concat(rightHalf)

    for (let j = 0; j < gene.length; j++) {
      if (Math.random() > MUTATION_RATE) {
        gene[j] = Math.random()
      }
    }
    genome[i] = gene
  }
  createCreature(left.group, genome, left.body.position)
}

function averageFitness(group) {
  return group.children.reduce(function (total, creature) {
    return total + group.fitness(creature)
  }, 0) / group.children.length
}

function summaryText() {
  return SUMMARY
    .replace('%s', generation)
    .replace('%s', averageFitness(population.alpha))
    .replace('%s', averageFitness(population.beta))
}

function breedGroup(group) {
  let fit = fitness[group.name]
  let doomed = group
    .children
    .sort(function (a, b) { return fit(b) - fit(a) })
    .slice(group.populationSize / 2, -1)
  for (let i = 0; i < doomed.length; i++) {
    die(doomed[i])
  }
  while (group.children.length < group.populationSize) {
    breed(game.rnd.pick(group.children), game.rnd.pick(group.children))
  }
}

function evolve() {
  breedGroup(population.alpha)
  breedGroup(population.beta)
}

function age(creature) {
  return generation - creature.generation
}

function die(creature) {
  creature.kill()
  creature.group.remove(creature)
}
