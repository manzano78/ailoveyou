import type { MiddlewareFunction } from 'react-router';
import { supabaseClient } from '~/infra/supabase';
import { getApiUserIdHash } from '~/infra/authentication';

const MAX_CALLS_PER_USER_AND_PER_DAY = 14;

function parseDay(dayString: string): Date {
  return new Date(`${dayString}T00:00:00Z`);
}

function serializeDay(date: Date): string {
  const [currentDateString] = date.toISOString().split('T');

  return currentDateString;
}

export const apiLimitationMiddleware: MiddlewareFunction<
  Response
> = async () => {
  // Check if the current user exists in the limitation table
  const { data, error: readError } = await supabaseClient
    .from('API_LIMITATION')
    .select('*')
    .eq('user_id', getApiUserIdHash());

  if (readError) {
    throw readError;
  }

  if (data.length === 0) {
    // First time the user hits the API. Let's create a new line.
    const { error: writeError } = await supabaseClient
      .from('API_LIMITATION')
      .insert([
        {
          user_id: getApiUserIdHash(),
          last_usage_day: serializeDay(new Date()),
          last_usage_day_counter: 1,
        },
      ])
      .select();

    if (writeError) {
      throw writeError;
    }
  } else {
    // The user is known, let's check its limitation status
    const [
      {
        last_usage_day: lastUsageDayString,
        last_usage_day_counter: lastUsageDayCounter,
      },
    ] = data;
    const lastUsageDate = parseDay(lastUsageDayString);
    const currentDate = new Date();

    if (
      currentDate.getDate() === lastUsageDate.getDate() &&
      currentDate.getMonth() === lastUsageDate.getMonth() &&
      currentDate.getFullYear() === lastUsageDate.getFullYear()
    ) {
      // The user already hit the API today, let's check the counter
      if (lastUsageDayCounter >= MAX_CALLS_PER_USER_AND_PER_DAY) {
        // The limit has been reached, let's reject it
        throw Response.json(
          {
            message:
              'The user has sent too many requests in a given amount of time',
          },
          { status: 429 },
        );
      }

      // The limit hasn't been reached, let's increment the counter
      const { error: writeError } = await supabaseClient
        .from('API_LIMITATION')
        .update({ last_usage_day_counter: lastUsageDayCounter + 1 })
        .eq('user_id', getApiUserIdHash())
        .select();

      if (writeError) {
        throw writeError;
      }
    } else {
      // The user exists and it's a new day. Let's change the date and reset the counter.
      const { error: writeError } = await supabaseClient
        .from('API_LIMITATION')
        .update({
          last_usage_day_counter: 1,
          last_usage_day: serializeDay(new Date()),
        })
        .eq('user_id', getApiUserIdHash())
        .select();

      if (writeError) {
        throw writeError;
      }
    }
  }
};
