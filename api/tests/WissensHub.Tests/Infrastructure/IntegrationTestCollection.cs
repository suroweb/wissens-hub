namespace WissensHub.Tests.Infrastructure;

[CollectionDefinition("Integration")]
public class IntegrationTestCollection : ICollectionFixture<IntegrationTestFixture>
{
    // This class has no code; its purpose is to define the test collection
    // so that all integration test classes share a single IntegrationTestFixture instance.
}
