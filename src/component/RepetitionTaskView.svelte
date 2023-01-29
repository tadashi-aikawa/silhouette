<script lang="ts">
  import Calendar from "@event-calendar/core";
  import DayGrid from "@event-calendar/day-grid";

  import { type TaskService } from "../app/TaskService";
  import { RepetitionTask } from "../domain/entity/RepetitionTask";
  import { BaseError, DateTime } from "owlelia";

  export let taskService: TaskService;

  let tasks: RepetitionTask[] | undefined;
  let taskError: BaseError | undefined;
  let currentTask: RepetitionTask | undefined;

  let holidays: DateTime[] | undefined;
  let holidaysError: BaseError | undefined;

  let datesInFuture: DateTime[] | undefined;

  const init = async () => {
    [tasks, taskError] = await taskService
      .loadRepetitionTasks()
      .then((x) => x.unwrap());
  };

  const handleClickTask = async (task: RepetitionTask) => {
    currentTask = task;
    [holidays, holidaysError] = (await taskService.loadHolidays()).unwrap();
    datesInFuture = taskService.calcDatesInFuture(task, holidays!);
  };

  let plugins = [DayGrid];
  $: options = {
    view: "dayGridMonth",
    highlightedDates: holidays?.map((x) => x.displayDate) ?? [],
    height: "100%",
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

  init();
</script>

<h3>Recurring tasks</h3>
<div style="height: calc(100% - 350px - 50px - 75px); overflow: scroll">
  {#if tasks}
    {#each tasks as task}
      <div
        class="nav-file-title"
        class:is-active={task == currentTask}
        on:click={handleClickTask(task)}
        on:keypress={handleClickTask(task)}
      >
        {task.name}
      </div>
    {/each}
  {/if}
</div>

<div style="height: 350px; overflow: scroll">
  <Calendar {plugins} {options} />
</div>

{#if currentTask}
  <div style="height: 50px; display: flex; justify-content: center;">
    {currentTask.name}
  </div>
{/if}
