<script lang="ts">

    import { Button } from "$lib/components/ui/button";
    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";
    
    import { Combobox } from "$lib/components/ui/combobox";

    import * as Resizable from "$lib/components/ui/resizable";

    import * as Dialog from "$lib/components/ui/dialog";

    import { toggleMode } from "mode-watcher";
    import { onMount } from "svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import DialogContent from "$lib/components/ui/dialog/dialog-content.svelte";
    import DialogHeader from "$lib/components/ui/dialog/dialog-header.svelte";
    import DialogDescription from "$lib/components/ui/dialog/dialog-description.svelte";

    let createAgentDialog = false;

    interface Item {
      componentMap: Record<string, any>; 
      components: any[];                 
      count: number;                     
      displayName: string;              
      metadata: number;                 
      name: string;                     
      nbt: any | null;                  
      removedComponents: any[];         
      slot: number;                     
      stackId: string | null;           
      stackSize: number;                
      type: number;                     
    }

    interface BotInfo {
      currentTask: string,
      name: string;
      health: number;
      model: string;
      position: {
        x: number;
        y: number;
        z: number;
      };
      rotation: {
        yaw: number;
        pitch: number;
      };
      height: number;
      dimension: string;
      gamemode: string;
      food: number;
      heldItem: Item | null;
      level: number;
      experience: number;
      inventory: Item[];
      inventorySize: number;
      uuid: number;
    }

    let selectedAgent: BotInfo | undefined = {
      currentTask: "mine",
      dimension: "overworld",
      model: "",
      experience: 0,
      food: 15,
      gamemode: "survival",
      health: 15,
      height: 1.8,
      heldItem: {
        componentMap: {},
        components: [],
        count: 1,
        displayName: "",
        metadata: 1,
        name: "",
        nbt: 1,
        removedComponents: [],
        slot: 1,
        stackId: "",
        stackSize: 1,
        type: 1
      },
      inventory: [],
      inventorySize: 46,
      level: 0,
      name: "Lily",
      position: {x: -329.50113248810504, y: 57, z: -423.41810684691075},
      rotation: {yaw: -3.1197098850178246, pitch: 0.0012589161946632288},
      uuid:72
    };

    let agents: BotInfo[] = [{
      currentTask: "",
      model: "",
      name: "",
      health: 0,
      position: {
        x: 0,
        y: 0,
        z: 0,
      },
      rotation:{
        yaw: 0,
        pitch: 0,
      },
      height: 0,
      dimension: "string",
      gamemode: "string",
      food: 0,
      heldItem: null,
      level: 0,
      experience: 0,
      inventory: [],
      inventorySize: 0,
      uuid: 6892,
    }];

    let webSocket:WebSocket;

    let formattedAgents = formatAgents(agents);

    onMount(() =>{
      webSocket = new WebSocket("ws://localhost:8080");
      webSocket.onopen = (event) => {
        console.log("WebSocket is open now.");
      };
      webSocket.onmessage = (event) => {
        let data = JSON.parse(event.data);
        if (data.type === "update") {
          agents = data.agents;
          formattedAgents = formatAgents(agents);

          if (selectedAgent) {
            const updated = agents.find(agent => agent.uuid === selectedAgent?.uuid);
            if (updated) {
              selectedAgent = updated;
              // console.log(updated)
            } else {
              selectedAgent = null; // In case the agent is no longer available
            }
          }
        }
      };
      webSocket.onclose = (event) => {
        console.log("WebSocket is closed now.");
      };
      webSocket.onerror = (event) => {
        console.error("WebSocket error observed:", event);
      };
    })


    function toUpper(str: string) {
      if (str.length < 2) return str.toUpperCase();

      return str.charAt(0).toUpperCase() + str.substring(1);
    }

    function formatAgents(agents: BotInfo[]) {
      if (!agents || agents.length === 0) {
        return [];
      }

      let agentsArray = agents.map(agent => ({  // for some reason .push returns the new LENGTH OF THE ARRAY???
            label: `${agent.name} | ${toUpper(agent.model)}`,
            value: agent.uuid.toString()
        }));

        agentsArray.push({
          label: "Create +",
          value: "createAgent"
        }); 

        return agentsArray; // append our little create agent at the end
    }

    function onSelect(value: string) {
        console.log("Selected value:", value);
        if (value === "createAgent") {
          createAgentDialog = true;
        
          selectedAgent = agents.find(agent => agent.uuid.toString() === value);
        } else {
          selectedAgent = agents.find(agent => agent.uuid.toString() === value);
          console.log("Selected agent:", selectedAgent);
        }
        
    }

    function onSubmit(e: Event) {
      e.preventDefault();
      console.log("Submitted form");
      console.log(e.target);
      const formData = new FormData(e.target as HTMLFormElement);
      console.log(formData);

      const name = formData.get("name") as string;
      const model = formData.get("model") as string;
    }
</script>

<!-- for this I like to use Resizable as a type of grid, its really useful -->

<Dialog.Root open={createAgentDialog} closeOnEscape={true} >

    <DialogContent>
      <DialogHeader>
        Create a new Agent!
      </DialogHeader>
      <DialogDescription>
        <form>

        </form>
      </DialogDescription>
    </DialogContent>

</Dialog.Root>


<div class="w-full h-[100dvh]">
  <Resizable.PaneGroup direction="vertical" class="w-full h-full flex flex-col">
    <Resizable.Pane class="flex flex-row items-center" defaultSize={8}>
  
      <Combobox _class="mr-auto ml-4" onSelect={onSelect} values={formattedAgents} defaultLabel="Agent"></Combobox>
  
      <Button class="ml-auto mr-4" on:click={toggleMode} variant="outline" size="icon">
          <Sun
            class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
          />
          <Moon
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          />
          <span class="sr-only">Toggle theme</span>
      </Button>
    </Resizable.Pane>
    <Separator />
    <Resizable.Pane>
      {#if selectedAgent != null}
      <div class="w-full h-full" id="agentDataDisplay">
        
        <Resizable.PaneGroup direction="horizontal" class="w-full h-full flex flex-col">
          <Resizable.Pane class="flex flex-col items-center p-2 justify-center" defaultSize={20} minSize={20} maxSize={50}>
            <div class="w-full h-full bg-secondary rounded flex flex-col justify-center items-center">

              <div class="mt-auto mb-2 font-bold text-4xl" id="namePlate">{selectedAgent.name}</div>
            </div>
            
          </Resizable.Pane>
          <Resizable.Handle withHandle={true} />
          <Resizable.Pane class="Pane">
            
          </Resizable.Pane>
        </Resizable.PaneGroup>
      </div>
      {/if}
    </Resizable.Pane>
  </Resizable.PaneGroup>
</div>
