<script lang="ts">

    import { Button } from "$lib/components/ui/button";
    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";
    
    import { Combobox } from "$lib/components/ui/combobox";

    import { toggleMode } from "mode-watcher";
    import { onMount } from "svelte";

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
      name: string;
      health: number;
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

    let selectedAgent: BotInfo | undefined = undefined;

    let agents: BotInfo[] = [{
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
      uuid: 0,
    }];

    let formattedAgents = formatAgents(agents);

    onMount(() =>{
      const webSocket = new WebSocket("ws://localhost:8080");
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

    function formatAgents(agents: BotInfo[]) {
      if (!agents || agents.length === 0) {
        return [];
      }
        return agents.map(agent => ({
            label: agent.name,
            value: agent.uuid.toString()
        }));
    }

    function onSelect(value: string) {
        console.log("Selected value:", value);
        selectedAgent = agents.find(agent => agent.uuid.toString() === value);
        console.log("Selected agent:", selectedAgent);
    }

</script>

<Combobox onSelect={onSelect} values={formattedAgents} defaultLabel="Agent"></Combobox>

<Button class="absolute right-4 top-4" on:click={toggleMode} variant="outline" size="icon">
    <Sun
      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Moon
      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
</Button>

{#if selectedAgent != null}

  <div class="w-full h-full" id="agentDataDisplay">
    <div class="">name: {selectedAgent.name}</div>
    <div class="">health: {selectedAgent.health}</div>
    <div class="">position: {selectedAgent.position.x}, {selectedAgent.position.y}, {selectedAgent.position.z}</div>
    <div class="">rotation: {selectedAgent.rotation.yaw}, {selectedAgent.rotation.pitch}</div>
    <div class="">height: {selectedAgent.height}</div>
    <div class="">dimension: {selectedAgent.dimension}</div>
    <div class="">gamemode: {selectedAgent.gamemode}</div>
    <div class="">food: {selectedAgent.food}</div>
    <div class="">heldItem: {selectedAgent.heldItem}</div>
    <div class="">level: {selectedAgent.level}</div>
    <div class="">experience: {selectedAgent.experience}</div>
    <div class="">inventorySize: {selectedAgent.inventorySize}</div>
    <div class="">uuid: {selectedAgent.uuid}</div>
    
  </div>

{/if}