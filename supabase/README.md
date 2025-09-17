# Supabase Local Development

This directory contains configuration and assets for developing with Supabase locally.

## Getting Started

1.  **Install the Supabase CLI:**
    If you haven't already, install the Supabase CLI on your machine.
    ```bash
    npm install -g supabase
    ```

2.  **Log in to Supabase:**
    ```bash
    supabase login
    ```

3.  **Link your project:**
    You will need your project's reference ID. Find it in your project's dashboard URL: `https://app.supabase.com/project/<ref>`.
    ```bash
    supabase link --project-ref <your-project-ref>
    ```
    This will create a `.supabase` directory to store local development files.

4.  **Start the local services:**
    ```bash
    supabase start
    ```
    This spins up a local instance of Postgres, Supabase Studio, and other services.

## Edge Functions

The `functions` directory contains your Supabase Edge Functions.

### Local Testing

To test your functions locally without worrying about JWT verification:

1.  **Serve the functions:**
    ```bash
    supabase functions serve --no-verify-jwt
    ```

2.  **Invoke a function:**
    You can use `curl` or any other HTTP client to test your function. For example, to test the `hello-world` function:
    ```bash
    curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
    ```

### Deployment

When you are ready to deploy your functions to the Supabase platform:

```bash
supabase functions deploy <function-name>
```

For example:
```bash
supabase functions deploy hello-world
```
