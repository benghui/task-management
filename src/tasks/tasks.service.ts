import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './tasks-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TasksRepository } from './task.repository';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
	constructor(
		@InjectRepository(TasksRepository)
		private taskRepository: TasksRepository,
	) { }

	getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
		return this.taskRepository.getTasks(filterDto, user);
	}

	async getTaskById(id: string, user: User): Promise<Task> {
		const found = await this.taskRepository.findOne({ where: { id, user } });

		if (!found) {
			throw new NotFoundException(`Task with ID "${id}" not found`);
		}

		return found;
	}

	createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
		return this.taskRepository.createTask(createTaskDto, user);
	}

	async deleteTask(id: string, user: User): Promise<void> {
		const result = await this.taskRepository.delete({ id, user });

		if (result.affected === 0) {
			throw new NotFoundException(`Task with ID "${id}" not found`);
		}
	}

	async updateTaskStatus(id: string, user: User, status: TaskStatus): Promise<Task> {
		const task = await this.getTaskById(id, user);

		task.status = status;
		await this.taskRepository.save(task)

		return task
	}
}
