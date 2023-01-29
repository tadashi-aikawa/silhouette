<script lang="ts">
  import { type TaskService } from "../app/TaskService";
  import { RepetitionTask } from "../domain/entity/RepetitionTask";
  import { BaseError, DateTime } from "owlelia";

  export let taskService: TaskService;

  let tasks: RepetitionTask[] | undefined;
  let taskError: BaseError | undefined;

  let datesInFuture: DateTime[] | undefined;
  let datesError: BaseError | undefined;

  const init = async () => {
    [tasks, taskError] = await taskService
      .loadRepetitionTasks()
      .then((x) => x.unwrap());
  };

  const handleClickTask = async (task: RepetitionTask) => {
    const [holidays, err] = (await taskService.loadHolidays()).unwrap();
    if (err) {
      datesError = err;
      return;
    }

    datesInFuture = taskService.calcDatesInFuture(task, holidays!);
  };

  init();
</script>

<div style="height: 50%; overflow: scroll">
  {#if tasks}
    <ul>
      {#each tasks as task}
        <li on:click={handleClickTask(task)}>{task.name}</li>
      {/each}
    </ul>
  {/if}
</div>

<div style="height: 50%; overflow: scroll">
  {#if datesInFuture}
    <ul>
      {#each datesInFuture as date}
        <li>{date.displayDate}</li>
      {/each}
    </ul>
  {/if}
</div>
