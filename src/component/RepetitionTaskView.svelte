<script lang="ts">
  import Calendar from "@event-calendar/core";
  import DayGrid from "@event-calendar/day-grid";

  import { type TaskService } from "../app/TaskService";
  import { RepetitionTask } from "../domain/entity/RepetitionTask";
  import { DateTime } from "owlelia";

  export let taskService: TaskService;
  export let tasks: RepetitionTask[] | undefined;
  export let holidays: DateTime[] | undefined;

  let currentTask: RepetitionTask | undefined;

  const handleClickTask = async (task: RepetitionTask) => {
    currentTask = task;
  };

  let plugins = [DayGrid];

  $: {
    if (tasks?.length > 0) {
      currentTask = tasks!.find((x) => x.name === currentTask?.name);
    }
  }

  $: datesInFuture = currentTask
    ? taskService.calcDatesInFuture(currentTask, holidays!)
    : undefined;

  $: options = {
    view: "dayGridMonth",
    highlightedDates: holidays?.map((x) => x.displayDate) ?? [],
    events: datesInFuture
      ? DateTime.today()
          .toDate(DateTime.today().plusMonths(3))
          .map((x) => {
            const has = datesInFuture!.some((d) => d.equals(x));
            return {
              start: x.date,
              end: x.date,
              title: has ? "o" : "x",
              backgroundColor: has
                ? "var(--silhouette-calendar-task-mark-on)"
                : "var(--silhouette-calendar-task-mark-off)",
            };
          })
      : [],
    eventContent: (info) => info.event.title,
  };
</script>

<h3>Recurring tasks</h3>
<div style="height: calc(100% - 325px - 50px - 75px); overflow: scroll">
  {#if tasks}
    {#each tasks as task}
      <div
        class="nav-file-title"
        class:is-active={currentTask && task.name == currentTask.name}
        on:click={handleClickTask(task)}
        on:keypress={handleClickTask(task)}
      >
        {task.name}
      </div>
    {/each}
  {/if}
</div>

<Calendar {plugins} {options} />

{#if currentTask}
  <div style="padding: 8px; display: flex; justify-content: center;">
    {currentTask.name}
  </div>
{/if}
