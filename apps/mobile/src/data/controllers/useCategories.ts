import { Q } from "@nozbe/watermelondb";
import { useEffect, useState } from "react";
import { database } from "../index";
import Category from "../models/Category";

export interface CategoriesData {
  categories: Category[];
  isLoading: boolean;
}

export function useCategories(): CategoriesData {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = database
      .get<Category>("categories")
      .query(Q.where("is_deleted", false))
      .observeWithColumns(["name", "icon", "type", "updated_at"])
      .subscribe((data) => {
        setCategories(data);
        setIsLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  return { categories, isLoading };
}

export interface CategoryRecord {
  category: Category | null;
  isLoading: boolean;
}

export function useCategory(id: string): CategoryRecord {
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const subscription = database
      .get<Category>("categories")
      .findAndObserve(id)
      .subscribe({
        next: (record) => {
          setCategory(record);
          setIsLoading(false);
        },
        error: (e) => {
          console.error(e);
          setIsLoading(false);
        },
      });

    return () => subscription.unsubscribe();
  }, [id]);

  return { category, isLoading };
}

export interface CategoryFormData {
  name: string;
  icon: string;
  type: string;
}

function applyCategoryFields(record: Category, data: CategoryFormData) {
  record.name = data.name;
  record.icon = data.icon;
  record.type = data.type;
}

export async function createCategory(data: CategoryFormData): Promise<void> {
  await database.write(async () => {
    await database.get<Category>("categories").create((record) => {
      applyCategoryFields(record, data);
    });
  });
}

export async function updateCategory(
  category: Category,
  data: CategoryFormData,
): Promise<void> {
  await database.write(async () => {
    await category.update((record) => applyCategoryFields(record, data));
  });
}

export async function deleteCategory(category: Category): Promise<void> {
  await database.write(async () => {
    await category.markAsDeleted();
  });
}
