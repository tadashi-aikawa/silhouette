<script lang="ts">
  import Calendar from "@event-calendar/core";
  import DayGrid from "@event-calendar/day-grid";

  import { type TaskService } from "../app/TaskService";
  import { RepetitionTask } from "@tadashi-aikawa/silhouette-core";
  import { DateTime } from "owlelia";
  import { parseMarkdownList } from "../utils/parser";

  export let taskService: TaskService;
  export let tasks: RepetitionTask[] | undefined;
  export let holidays: DateTime[] | undefined;

  let currentTask: RepetitionTask | undefined;
  type RepetitionTaskWithCondition = RepetitionTask & {
    repetitionCondition?: string;
  };

  const handleClickTask = async (task: RepetitionTask) => {
    currentTask = task;
  };

  const displayTaskName = (task: RepetitionTask) =>
    parseMarkdownList(task.name).content;
  const displayRepetitionCondition = (task: RepetitionTask) =>
    (task as RepetitionTaskWithCondition).repetitionCondition ?? "";

  let plugins = [DayGrid];

  $: {
    if (tasks?.length && tasks.length > 0) {
      currentTask = tasks!.find((x) => x.name === currentTask?.name);
    }
  }

  $: datesInFuture = currentTask
    ? taskService.calcDatesInFuture(currentTask, holidays!, 3)
    : undefined;

  $: options = {
    view: "dayGridMonth",
    headerToolbar: {
      start: "today title prev,next",
      center: "",
      end: "",
    },
    highlightedDates: holidays?.map((x) => x.displayDate) ?? [],
    dayCellFormat: (date: Date) => date.getDate().toString(),
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
    eventContent: (info: any) => info.event.title,
  };
</script>

<h3>Recurring tasks</h3>
<div class="silhouette-repetition-task-list">
  {#if tasks}
    {#each tasks as task}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="nav-file-title silhouette-repetition-task-list__item"
        class:is-active={currentTask && task.name == currentTask.name}
        on:click={() => handleClickTask(task)}
        on:keypress={() => handleClickTask(task)}
      >
        <div class="silhouette-repetition-task-list__item-name">
          {displayTaskName(task)}
        </div>
        <div class="silhouette-repetition-task-list__item-condition">
          {displayRepetitionCondition(task)}
        </div>
      </div>
    {/each}
  {/if}
</div>

<div class="silhouette-repetition-calendar">
  <Calendar {plugins} {options} />
</div>

{#if currentTask}
  <div style="padding: 8px; display: flex; justify-content: center;">
    {displayTaskName(currentTask)}
  </div>
{/if}
