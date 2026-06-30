# MBot Scratch Editor

The MBot Scratch Editor is a fork of the [Scratch Editor Monorepo](https://github.com/scratchfoundation/scratch-editor), which contains the packages that make up the Scratch 3.0 interface and virtual machine. This fork contains a custom extension that enables Scratch blocks for controlling the University of Michigan MBot.

## Setup process
### Install nvm if not installed
**THIS IS IMPORTANT**. Having node is not enough, the start script relies on having nvm specifically.
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
source ~/.bashrc
nvm install node
nvm use node
```

### Clone the library
It does not actually matter where this is cloned to anymore. It is all one repo now so you can put it wherever you want. ~/Workspace is just a good default. Using `--recurse-submodules` downloads [mbot-bridge](https://github.com/mbot-project/mbot_bridge) which is a required dependency.
```bash
cd ~/Workspace
git clone --recurse-submodules --depth 1 https://github.com/Veldrovive/scratch-editor-mbot.git
```

### Test build & run
This is just to make sure it builds correctly. Shouldn't actually be necessary if you just want to install.
```bash
cd scratch-editor-mbot
npm install
npm run --workspaces build
```

At this point, if you want to test to make sure it is working, you can run this. This step is not required to install.
```bash
npm start
```
This will start a development server.

### Install
If that works, then you can proceed to the final build and install.
```bash
# I assume we are still in .../scratch-editor-mbot
./install_scripts/install.sh
```
This builds the scratch app into a static website and copies it to "/data/www/scratch" where we will serve it from. It also installs the `serve` node module globally so that we will be able to use it to actually serve the app whether or not we are connected to the internet.

Now we can install the service which will start the server every time the MBot starts.
```bash
# I assume we are still in .../scratch-editor-mbot
./services/install_service.sh
```
Now every time the MBot boots, it will call the script `services/start_service.sh` (or a version of it copied to `/usr/local/bin/mbot-scratch-gui-start`) which checks all conditions and starts a webserver on port "8602". This port is hardcoded in `services/start_service.sh`. If you change it then you need to rerun `install_service.sh` in order to update it for the service.

## Normal usage

After doing the setup, the MBot should host a server at `http://[MBOT_IP]:8602` every time it starts up. Navigate to this to start.

## Notes
We now include [mbot-bridge](https://github.com/mbot-project/mbot_bridge) as a submodule so that we do not need to have the absolute path to the library in order to build. This means you can now have the scratch repo wherever you want.

The "mbot" extension should automatically be loaded when scratch starts. This can cause issues in cases where the extension crashes on startup. If this is a problem at any point, remove `mbot` from the `CORE_EXTENSIONS` list in `packages/scratch-vm/src/virtual-machine.js`.

### Demos and Examples
I added `demos/duckling.sb3` as a demo script. It makes the MBot follow you at a certain distance. 
You can now load demos directly from the Scratch editor by clicking the "Demos" menu in the top navigation bar.

**How the Demos menu works:**
1. Any `.sb3` file placed in the `demos/` directory at the root of the project will automatically be added to the menu.
2. A script (`scripts/generate_demos_list.js`) runs automatically during the `prebuild` and `prestart` steps of the `scratch-gui` package. This script scans the `demos/` folder and generates a `demos.json` list.
3. Webpack is configured (via `CopyWebpackPlugin` in `packages/scratch-gui/webpack.config.js`) to copy the entire `demos/` directory into `static/demos/` when building.
4. The `DemosMenu` component reads the JSON list and fetches the corresponding `.sb3` file directly from the static web server when clicked. This ensures it works seamlessly with both `npm start` (webpack-dev-server) and the production build installed by `install_scripts/install.sh`.

I created a `scripts/mbot_mock_server.js` script for local testing. This makes a websocket server that acts like the mbot-bridge but does not require any actual backing to it. Use it when you want to test on a computer that is not an MBot.

I updated the mbot extension to have an emergency stop feature which immediately kills any velocity when the script ends execution or the red stop button is pressed. I implemented this after the MBot decided to try to bury itself in my laundry and I couldn't stop it.

I also removed hardcoded paths and node versions in the service so it should be more robust to different versions now.

If we move to ROS instead of LCM in future versions of the omni iterations, then [mbot-bridge](https://github.com/mbot-project/mbot_bridge) must be updated to bridge to the new system.

## Pulling from Upstream

The original Scratch repositories receive about 100 commits per week because of dependency bot updates. This leads to Scratch creating several new releases *every week*. Every once in a while, we should sync our forks with the original repositories. To do this, use the following commands.

```bash
git remote add upstream https://github.com/scratchfoundation/scratch-editor.git
git fetch upstream
git rebase upstream/develop
```
At this point, there will likely be merge conflicts. They should mostly be in `package-lock.json`. Resolve these conflicts before continuing. Once the merge conflicts are resolved, finish the rebase.
```bash
git rebase --continue
git config pull.rebase false
git pull
git push
```

---

# Upstream README

# scratch-editor: The Scratch Editor Monorepo

If you'd like to use Scratch, please visit the [Scratch website](https://scratch.mit.edu/). You can build your own
Scratch project by pressing "Create" on that website or by visiting <https://scratch.mit.edu/projects/editor/>.

This is a source code repository for the packages that make up the Scratch editor and a few additional support
packages. Use this if you'd like to learn about how the Scratch editor works or to contribute to its development.

## What's in this repository?

The `packages` directory in this repository contains:

- `scratch-gui` provides the buttons, menus, and other elements that you interact with when creating and editing a
  project. It's also the "glue" that brings most of the other modules together at runtime.
- `scratch-media-lib-scripts` builds (or rebuilds) media libraries for the editor.
- `scratch-paint` provides a way to draw vector (SVG) or bitmap (PNG) images for costumes and backdrops.
- `scratch-render` draws backdrops, sprites, and clones on the stage.
- `scratch-storage` helps load project assets like images and sounds. It also provides `ScratchFetch`, a customized
  wrapper around `fetch`.
- `scratch-svg-renderer` processes SVG (vector) images for use with Scratch projects.
- `scratch-vm` is the virtual machine that runs Scratch projects.
- `task-herder` manages queues of tasks with throttling and concurrency limits.

_Please add to this list as more packages are migrated to the monorepo._

Each package has its own `README.md` file with more information about that package.

## Monorepo migration

### What's going on?

We're migrating the Scratch editor packages into this monorepo. This will allow us to manage all the packages that
make up the Scratch editor in one place, making  it easier to manage dependencies and make changes that affect
multiple packages.

### Why are there only a few packages in this repo?

We're migrating packages in stages. The current plan, which is subject to change, has us migrating repositories in
four batches. We plan to complete the migration within 2025.

### What will happen to the existing repositories?

The existing repositories will be archived and made read-only. Those repositories contain valuable work and
information, including but not limited to issues and pull requests. We plan to keep that information available for
reference, and to selectively migrate it to this new repository.

## Thank you

Scratch would not be what it is today without help from the global community of Scratchers and open-source
contributors. Thank you for your contributions and support. _[Scratch on!](https://scratch.mit.edu/projects/65347738/fullscreen/)_

## Donate

We provide [Scratch](https://scratch.mit.edu) free of charge, and want to keep it that way! Please consider making a
[donation](https://www.scratchfoundation.org/donate) to support our continued engineering, design, community, and
resource development efforts. Donations of any size are appreciated. Thank you!
