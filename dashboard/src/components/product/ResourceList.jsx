import api from "../../lib/api";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";

const statusColor = {
  pending: "secondary",
  processing: "outline",
  done: "default",
  failed: "destructive",
};

const ResourceList = ({ resources, productId, onRefresh }) => {
  const handleDelete = async (resourceId) => {
    if (!confirm("Delete this KT resource? This will remove all its chunks.")) return;

    try {
      await api.delete(`/upload/${productId}/${resourceId}`);
      toast.success("Resource deleted");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete resource");
    }
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No KT resources uploaded yet</p>
        <p className="text-sm mt-1">
          Go to the Upload tab to add KT videos or documents
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        {resources.length} resource{resources.length > 1 ? "s" : ""} uploaded
      </p>

      {resources.map((resource) => (
        <Card key={resource.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-sm">{resource.file_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {resource.file_type} •{" "}
                {new Date(resource.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={statusColor[resource.status] || "outline"}>
                {resource.status}
              </Badge>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(resource.id)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResourceList;