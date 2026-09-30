import { PostsList, type PostsListProps } from './posts-list'

export function Demo(props: PostsListProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <PostsList key={JSON.stringify(props)} {...props} />
    </div>
  )
}
