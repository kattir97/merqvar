import { z } from "zod";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { wordSchema } from "~/types/word-schema";
import { getInputProps, useForm } from "@conform-to/react";
import { X } from "lucide-react";
import { useState } from "react";

type WordFormFields = z.infer<typeof wordSchema>;

type UseFormReturnType = ReturnType<typeof useForm<WordFormFields>>;

interface TagsProps {
  form: UseFormReturnType[0];
  fields: UseFormReturnType[1];
}

export default function Tags({ fields }: TagsProps) {
  const [tags, setTags] = useState(fields.tags.getFieldList());
  // const tags = fields.tags.getFieldList();
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    if (newTag.trim() !== "") {
      // form.insert({ name: fields.tags.name, defaultValue: newTag.trim() });

      const baseTag = fields.tags.getFieldList()[0];

      const tagObj = {
        ...baseTag,
        key: `tag-${tags.length}`,
        name: `${fields.tags.name}-${tags.length}`,
        id: `${fields.tags.id}-${tags.length}`,
        intialValue: "",
        value: newTag,
      };

      setTags([...tags, tagObj]);
      setNewTag(""); // Clear the input after adding
    }
  };

  const handleRemoveTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-2 w-full md:w-1/2">
      <h1 className="text-lg">Теги:</h1>

      <div className="flex flex-col gap-4">
        <div className="flex place-items-center gap-2">
          <Input
            {...getInputProps(fields.tags, { type: "text" })}
            name={`${fields.tags.name}-${tags.length}`}
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(e);
              }
            }}
          />
          <Button type="button" onClick={(e) => handleAddTag(e)}>
            Добавить тег
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tags.map((tag, index) => {
            return (
              <Badge
                key={tag.key}
                variant="secondary"
                className="flex items-center gap-2 p-2"
                defaultValue={tag.initialValue}
              >
                <span>{tag.initialValue || tag.value}</span>
                <input
                  key={`hidden-tag-${index}`}
                  type="hidden"
                  name={`tags[${index}]`}
                  value={tag.value}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTag(index)}
                >
                  <X size={16} />
                </Button>
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
