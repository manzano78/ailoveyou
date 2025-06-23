import type { Route } from './+types/add-message';
import { FileUpload, parseFormData } from '@mjackson/form-data-parser';
import { supabaseClient } from '~/infra/supabase';
import { getSessionUser } from '~/infra/session';

export async function loader() {}

export async function action({ request }: Route.ActionArgs) {
  supabaseClient
    .from('PC_CONVERSATION')
    .select('*')
    .eq('user_id', getSessionUser().id);
  const formData = await parseFormData(request, async (fileUpload) => {
    if (fileUpload.fieldName === 'audio-prompt') {
      supabaseClient.from('PC_CONVERSATION');
    }
  });
}
