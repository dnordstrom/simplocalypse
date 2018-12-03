/**
 * Holds simulation results in `this.results`, as array of number of days it
 * took simulations to reach 100% infection rate. Takes argument specifying
 * in which HTML element to render results.
 */
class Results {
  constructor(options) {
    this.results = [];
    this.options = {
      container: document.body,
      ...options
    }
  }

  add(days) {
    this.results.push(days)
  }

  render() {
    let div = document.createElement('div');
    let iterations = this.results.length;
    let totalDays = this.results.reduce((prev, curr) => prev + curr, 0);
    let averageDays = totalDays / iterations;
    
    div.innerText =
      `Simulation ran ${iterations} times. Town lifespan expectancy is ${averageDays} days.`;

    this.options.container.innerHTML = '';
    this.options.container.appendChild(div);
  }
}

/**
 * Controls single simulation, takes arguments specifying delay between
 * ticks/days, number of houses to render, and which HTML element to render in.
 */
class Simulation {
  constructor(options) {
    this.zombies = 1;
    this.day = 0;
    this.options = {
      container: document.body,
      delay: 200,
      numberOfHouses: 100,
      ...options
    }
    this.houses = new Array(this.options.numberOfHouses).fill(false);
  }

  /**
   * Gets called when simulation is complete.
   */
  onDone() {
    console.log('onDone() not defined.');
  }

  /**
   * Clears timer, stopping more ticks from executing.
   */
  stop() {
    clearInterval(this.timer);
  }

  /**
   * A single tick/day, updates town infection rate and calls `this.stop()`
   * if full infection is reached.
   */
  tick() {
    let newlyInfected = 0;

    this.day++;

    /* For each zombie, enter a random house */
    for (let zombie = 0; zombie < this.zombies; zombie++) {
      let randomHouseNumber = Math.floor(Math.random() * this.houses.length);
      
      /* `false` means house is not yet infected */
      if (!this.houses[randomHouseNumber]) {
        this.houses[randomHouseNumber] = true;
        newlyInfected++;
        /* House has now been infected */
      }
    }

    /* Add some more zombies if anyone was infected */
    this.zombies += newlyInfected;
    
    /* Render new town representation */
    this.render();

    /* If there are no more uninfected (`false`) houses, the entire town has
     * been infected and we stop the simulation, calling the `this.onDone`
     * callback method */
    if (!this.houses.includes(false)) {
      this.stop();
      this.onDone(this);
    }
  }

  /*
   * Start simulation, setInterval executes a tick according to delay option
   */
  start() {
    this.timer = setInterval(() => {
      this.tick();
    }, this.options.delay);
  }

  /**
   * Render town representation
   */
  render() {
    this.options.container.innerHTML = '';
    
    this.houses.forEach(house => {
      let div = document.createElement('div');

      div.className = `house ${house ? 'infected' : ''}`;
      div.innerText = house ? 'X' : 'O';
      this.options.container.appendChild(div);
    })
  }
}

/**
 * Sets up simulations, runs them, and stores result. Takes as arguments an
 * HTML selector to render app in, a delay for simulations, the number of
 * simulations to run, and number of houses per simulation.
 */
class Application {
  constructor(options) {
    this.options = {
      root: 'body',
      delay: 200,
      numberOfSimulations: 5,
      numberOfHouses: 100,
      ...options
    }
    this.options.root = document.querySelector(this.options.root);
    this.results = new Results({ container: this.options.root });
    this.simulations = new Array(this.options.numberOfSimulations)
      .fill()
      .map(() => { return new Simulation({
        container: this.options.root,
        delay: this.options.delay,
        numberOfHouses: this.options.numberOfHouses
      })});

    this.initSynchronousSimulations();
  }

  /**
   * Since setInterval makes our simulation ticks run asynchronously (two
   * simulations may run in parallell), we start the next simulation when the
   * previous one is finished (using its `onDone` callback).
   */
  initSynchronousSimulations() {
    this.simulations.reduce((prev, current) => {
      prev.onDone = (state) => {
        this.results.add(state.day);
        current.start();
      }
    
      return current;
    });
    
    this.simulations[this.options.numberOfSimulations - 1].onDone = (state) => {
      this.results.add(state.day);
      this.results.render();
    }
  }

  run() {
    this.simulations[0].start();
  }
}

const app = new Application({
  root: '#app',
  numberOfSimulations: 10,
  numberOfHouses: 100,
  delay: 500
});

app.run();
