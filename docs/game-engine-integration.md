# Game Engine Integration Guide

This guide explains how to integrate the RPG Event Generator into popular game engines, with export tools and integration examples.

## Supported Engines

- **Unity** (C#)
- **Godot** (GDScript)
- **Unreal Engine** (C++)

## Unity Integration

### Exporting Events

Use the provided export script to generate Unity-compatible C# classes:

```bash
# Export templates to Unity C# scripts
npm run export:unity -- --input ./templates --output ./unity-assets
```

This generates:
- `EventTemplate.cs` - Base event template class
- `EventChoice.cs` - Choice effect structure
- `EventGenerator.cs` - Unity integration wrapper
- Individual template files as C# classes

### Unity C# Integration

```csharp
using UnityEngine;
using RPGEventGenerator;

public class GameEventManager : MonoBehaviour
{
    private EventGenerator eventGenerator;

    void Start()
    {
        // Initialize the event generator
        eventGenerator = new EventGenerator();
    }

    public void GenerateRandomEvent()
    {
        // Generate an event
        var rpgEvent = eventGenerator.GenerateEvent();

        // Display in UI
        ShowEventDialog(rpgEvent);
    }

    public void GenerateFromTemplate(string templateId)
    {
        // Generate from specific template
        var rpgEvent = eventGenerator.GenerateFromTemplate(templateId);

        // Handle the event
        ProcessEvent(rpgEvent);
    }

    private void ShowEventDialog(RPGEvent rpgEvent)
    {
        // Create UI dialog
        var dialog = Instantiate(eventDialogPrefab);
        dialog.SetupEvent(rpgEvent);

        // Handle choice selection
        dialog.OnChoiceSelected += (choiceIndex) => {
            var choice = rpgEvent.Choices[choiceIndex];
            ApplyChoiceEffects(choice);
        };
    }

    private void ApplyChoiceEffects(EventChoice choice)
    {
        // Apply effects to game state
        if (choice.Effect.Gold != 0) {
            playerInventory.Gold += choice.Effect.Gold;
        }

        if (choice.Effect.Health != 0) {
            playerStats.Health += choice.Effect.Health;
        }

        // Handle other effects...
    }
}
```

### Unity Event Dialog Example

```csharp
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class EventDialog : MonoBehaviour
{
    [SerializeField] private TextMeshProUGUI titleText;
    [SerializeField] private TextMeshProUGUI descriptionText;
    [SerializeField] private Button[] choiceButtons;
    [SerializeField] private TextMeshProUGUI[] choiceTexts;

    public event System.Action<int> OnChoiceSelected;

    private RPGEvent currentEvent;

    public void SetupEvent(RPGEvent rpgEvent)
    {
        currentEvent = rpgEvent;

        titleText.text = rpgEvent.Title;
        descriptionText.text = rpgEvent.Description;

        // Setup choice buttons
        for (int i = 0; i < rpgEvent.Choices.Length && i < choiceButtons.Length; i++)
        {
            choiceButtons[i].gameObject.SetActive(true);
            choiceTexts[i].text = rpgEvent.Choices[i].Text;

            int choiceIndex = i; // Capture for closure
            choiceButtons[i].onClick.AddListener(() => {
                OnChoiceSelected?.Invoke(choiceIndex);
                CloseDialog();
            });
        }

        // Hide unused buttons
        for (int i = rpgEvent.Choices.Length; i < choiceButtons.Length; i++)
        {
            choiceButtons[i].gameObject.SetActive(false);
        }
    }

    private void CloseDialog()
    {
        Destroy(gameObject);
    }
}
```

## Godot Integration

### Exporting Events

Export templates for Godot GDScript:

```bash
# Export templates to Godot GDScript
npm run export:godot -- --input ./templates --output ./godot-scripts
```

This generates:
- `event_template.gd` - Base event template script
- `event_generator.gd` - Godot integration wrapper
- Individual template files as GDScript classes

### Godot GDScript Integration

```gdscript
extends Node

class_name EventManager

# Preloaded event generator
var event_generator = preload("res://scripts/event_generator.gd").new()

func _ready():
    # Initialize with custom settings if needed
    event_generator.initialize({
        "enable_templates": true,
        "template_library": "fantasy"
    })

func generate_random_event() -> Dictionary:
    return event_generator.generate_event()

func generate_from_template(template_id: String) -> Dictionary:
    return event_generator.generate_from_template(template_id)

func show_event_dialog(event_data: Dictionary):
    var dialog = preload("res://scenes/event_dialog.tscn").instantiate()
    add_child(dialog)
    dialog.setup_event(event_data)
    dialog.connect("choice_selected", Callable(self, "_on_choice_selected"))

func _on_choice_selected(choice_index: int, event_data: Dictionary):
    var choice = event_data.choices[choice_index]
    apply_choice_effects(choice.effect)

func apply_choice_effects(effect: Dictionary):
    # Apply effects to game state
    if effect.has("gold"):
        GameState.player_gold += effect.gold

    if effect.has("health"):
        GameState.player_health += effect.health

    if effect.has("experience"):
        GameState.player_experience += effect.experience

    # Handle relationships
    if effect.has("relationships"):
        for npc_id in effect.relationships:
            GameState.npc_relationships[npc_id] += effect.relationships[npc_id]

    # Handle items
    if effect.has("items"):
        for item_id in effect.items:
            GameState.player_inventory.add_item(item_id)
```

### Godot Event Dialog

```gdscript
extends Control

class_name EventDialog

signal choice_selected(choice_index, event_data)

@onready var title_label = $TitleLabel
@onready var description_label = $DescriptionLabel
@onready var choice_container = $ChoiceContainer

var current_event_data: Dictionary

func setup_event(event_data: Dictionary):
    current_event_data = event_data

    title_label.text = event_data.title
    description_label.text = event_data.description

    # Clear existing choices
    for child in choice_container.get_children():
        child.queue_free()

    # Create choice buttons
    for i in range(event_data.choices.size()):
        var choice = event_data.choices[i]
        var button = Button.new()
        button.text = choice.text
        button.connect("pressed", Callable(self, "_on_choice_pressed").bind(i))
        choice_container.add_child(button)

func _on_choice_pressed(choice_index: int):
    emit_signal("choice_selected", choice_index, current_event_data)
    queue_free()
```

## Unreal Engine Integration

### Exporting Events

Export templates for Unreal Engine C++:

```bash
# Export templates to Unreal C++ classes
npm run export:unreal -- --input ./templates --output ./unreal-source
```

This generates:
- `EventTemplate.h/.cpp` - Base event template classes
- `EventGenerator.h/.cpp` - Unreal integration wrapper
- Individual template files as C++ classes

### Unreal Engine C++ Integration

```cpp
// EventManager.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "EventManager.generated.h"

UCLASS()
class YOURGAME_API AEventManager : public AActor
{
    GENERATED_BODY()

public:
    AEventManager();

    UFUNCTION(BlueprintCallable, Category = "Events")
    void GenerateRandomEvent();

    UFUNCTION(BlueprintCallable, Category = "Events")
    FEventData GenerateFromTemplate(const FString& TemplateId);

    UFUNCTION(BlueprintCallable, Category = "Events")
    void ApplyChoiceEffect(const FEventChoice& Choice);

private:
    UPROPERTY()
    UEventGenerator* EventGenerator;
};

// EventManager.cpp
#include "EventManager.h"
#include "EventGenerator.h"

AEventManager::AEventManager()
{
    EventGenerator = NewObject<UEventGenerator>(this);
}

void AEventManager::GenerateRandomEvent()
{
    FEventData EventData = EventGenerator->GenerateEvent();

    // Show event UI
    ShowEventDialog(EventData);
}

FEventData AEventManager::GenerateFromTemplate(const FString& TemplateId)
{
    return EventGenerator->GenerateFromTemplate(TemplateId);
}

void AEventManager::ApplyChoiceEffect(const FEventChoice& Choice)
{
    // Apply gold
    if (Choice.Effect.Gold != 0)
    {
        PlayerGold += Choice.Effect.Gold;
    }

    // Apply health
    if (Choice.Effect.Health != 0)
    {
        PlayerHealth += Choice.Effect.Health;
    }

    // Apply experience
    if (Choice.Effect.Experience != 0)
    {
        PlayerExperience += Choice.Effect.Experience;
    }

    // Handle relationships
    for (const auto& Relationship : Choice.Effect.Relationships)
    {
        NPCRelationships[Relationship.Key] += Relationship.Value;
    }

    // Handle items
    for (const FString& ItemId : Choice.Effect.Items)
    {
        PlayerInventory.AddItem(ItemId);
    }

    // Handle flags
    for (const FString& Flag : Choice.Effect.Flags)
    {
        GameFlags.Add(Flag);
    }
}
```

### Unreal Engine Blueprints

For Blueprint-only projects, create wrapper functions:

```cpp
// Blueprint-callable functions
UFUNCTION(BlueprintCallable, Category = "RPG Events")
static FEventData GenerateRandomEvent();

UFUNCTION(BlueprintCallable, Category = "RPG Events")
static FEventData GenerateFromTemplate(const FString& TemplateId);

UFUNCTION(BlueprintCallable, Category = "RPG Events")
static void ApplyEventChoice(const FEventChoice& Choice, APlayerState* PlayerState);
```

### Blueprint Event Dialog

Create a Blueprint widget for displaying events:

1. **Create Widget Blueprint** named `WB_EventDialog`
2. **Add Components**:
   - Text Block for Title
   - Text Block for Description
   - Vertical Box for Choices
   - Button for each choice

3. **Widget Logic**:
   - Set title and description from event data
   - Create buttons dynamically for each choice
   - Bind button clicks to choice selection
   - Call event manager to apply effects

## Generic Integration Pattern

For any game engine, follow this pattern:

### 1. Initialize Generator

```javascript
const generator = new RPGEventGenerator({
    enableTemplates: true,
    templateLibrary: 'fantasy',
    // Add other options as needed
});
```

### 2. Event Generation

```javascript
// Random event
const event = generator.generateEvent();

// Template-specific event
const event = generator.generateFromTemplate('merchant_encounter');

// Context-aware event
const event = generator.generateEvent({
    level: player.level,
    location: player.location,
    reputation: player.reputation
});
```

### 3. Event Display

```javascript
function showEvent(event) {
    // Display title and description
    ui.showTitle(event.title);
    ui.showDescription(event.description);

    // Display choices
    event.choices.forEach((choice, index) => {
        ui.addChoiceButton(choice.text, () => {
            handleChoice(choice, index);
        });
    });
}
```

### 4. Effect Application

```javascript
function handleChoice(choice, index) {
    // Apply effects to game state
    applyEffects(choice.effect);

    // Record player choice for future context
    recordChoice(event.id, index);

    // Close event dialog
    closeEventDialog();
}

function applyEffects(effect) {
    // Currency
    if (effect.gold) player.gold += effect.gold;

    // Resources
    if (effect.health) player.health += effect.health;
    if (effect.mana) player.mana += effect.mana;

    // Experience
    if (effect.experience) player.experience += effect.experience;

    // Items
    if (effect.items) {
        effect.items.forEach(item => player.inventory.add(item));
    }

    // Relationships
    if (effect.relationships) {
        Object.entries(effect.relationships).forEach(([npc, change]) => {
            npcRelationships[npc] += change;
        });
    }

    // Flags/Quests
    if (effect.flags) {
        effect.flags.forEach(flag => gameFlags.add(flag));
    }

    // Stats
    if (effect.stats) {
        Object.entries(effect.stats).forEach(([stat, change]) => {
            player.stats[stat] += change;
        });
    }
}
```

## Performance Considerations

### Template Preloading

For better performance, preload frequently used templates:

```javascript
// Preload common templates
const commonTemplates = ['merchant', 'combat', 'social'];
generator.preloadTemplates(commonTemplates);
```

### Caching

Enable caching for repeated generations:

```javascript
const generator = new RPGEventGenerator({
    enableTemplateCaching: true,
    enableEventCaching: true
});
```

### Database Integration

For large template libraries, use database storage:

```javascript
const generator = new RPGEventGenerator({
    enableDatabase: true,
    databaseAdapter: new MyDatabaseAdapter()
});

// Load templates from database
await generator.loadTemplatesFromDatabase();
```

## Error Handling

Always wrap event generation in try-catch blocks:

```javascript
try {
    const event = generator.generateEvent();
    showEvent(event);
} catch (error) {
    console.error('Failed to generate event:', error);
    showFallbackEvent();
}
```

## Testing Integration

Create unit tests for your integration:

```javascript
describe('Event Integration', () => {
    test('should generate valid events', () => {
        const event = generator.generateEvent();
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('choices');
        expect(event.choices.length).toBeGreaterThan(1);
    });

    test('should apply choice effects correctly', () => {
        const choice = {
            effect: { gold: 10, health: -5, items: ['sword'] }
        };

        applyChoiceEffects(choice);

        expect(player.gold).toBe(10);
        expect(player.health).toBe(-5);
        expect(player.inventory).toContain('sword');
    });
});
```

## Advanced Features

### Custom Templates

Create game-specific templates:

```javascript
const customTemplate = {
    id: 'space_battle',
    title: 'Space Battle',
    narrative: 'Enemy ships approach!',
    choices: [
        { text: 'Fire weapons', effect: { fuel: -10, enemy_health: -20 } },
        { text: 'Attempt evasive maneuvers', effect: { fuel: -5, hull_integrity: 5 } }
    ]
};

generator.registerTemplate('space_battle', customTemplate);
```

### Conditional Events

Use context to control event generation:

```javascript
const context = {
    playerLevel: player.level,
    currentLocation: player.location,
    questProgress: player.questFlags,
    relationships: player.relationships
};

const event = generator.generateEvent(context);
```

### Event Chains

Create multi-step event sequences:

```javascript
// Start a chain
const chainId = generator.startChain('dragon_quest_chain', context);

// Advance through chain stages
generator.advanceChain(chainId, { defeated_minions: true });
```

This integration guide provides a foundation for incorporating the RPG Event Generator into your game projects across different engines.