'use strict'

var START_POPULATION = 20
var GENE_LENGTH = 1000, GENOME_LENGTH = 10
var SUMMARY = `Generation: %s
Alpha fitness: %s
Beta fitness: %s`

var SPEED = 200
var BOUNCE = 1
var DAMAGE = 0.5
var MUTATION_THRESHOLD = 0.1

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game',
                       { preload: preload, create: create, update: update })

var population, summary, generation, step

var fitness = {
  alpha: function (creature) {
    return creature.score
  },

  beta: function (creature) {
    return creature.score
  }
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

    for (let i = 0; i < START_POPULATION / 2; i++) {
      createRandomCreature(group)
    }
  }

  summary = game.add.text(16, 16, summaryText(),
                          { fontSize: '12px', fill: 'white' })
}

function update() {
  summary.text = summaryText()

  let creatures = population.alpha.children.concat(population.beta.children)

  if (step++ > GENE_LENGTH) {
    generation++
    step = 0
    evolve()
    return
  }


  for (let i = 0; i < creatures.length; i++) {
    let creature = creatures[i]
    let genome = creature.genome
    creature.body.acceleration.x = speed(genome[0][step])
    creature.body.acceleration.y = speed(genome[1][step])
    population.beta.children.map(function (creature) {
      if (creature.alive) creature.score += 1
    })
  }

  // game.physics.arcade.collide(population.alpha, population.alpha, breed)
  // game.physics.arcade.collide(population.beta, population.beta, breed)
  game.physics.arcade.collide(population.alpha)
  game.physics.arcade.collide(population.beta)
  game.physics.arcade.collide(population.alpha, population.beta, eat)
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
  let sprite = group.create(location.x, location.y, group.name)
  sprite.genome = randomGenome()
  sprite.score = 0
  sprite.group = group
  sprite.body.collideWorldBounds = true
  sprite.body.bounce.x = sprite.body.bounce.y = BOUNCE
}

function createRandomCreature(group) {
  createCreature(group, randomGenome(), randomLocation())
}

function speed(gene) {
  return Math.floor(2 * SPEED * gene) - SPEED
}

function eat(alpha, beta) {
  beta.health -= DAMAGE
  if (beta.health < 0) {
    alpha.score += 2
    beta.kill()
    population.beta.remove(beta)
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
      if (Math.random() > MUTATION_THRESHOLD) {
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
    .slice(START_POPULATION / 4, -1)
  for (let i = 0; i < doomed.length; i++) {
    doomed[i].kill()
    group.remove(doomed[i])
  }
  var foo = 0
  while (group.children.length < START_POPULATION / 2) {
    breed(game.rnd.pick(group.children), game.rnd.pick(group.children))
    if (foo++ > 20) break
  }
}

function evolve() {
  breedGroup(population.alpha)
  breedGroup(population.beta)
}
